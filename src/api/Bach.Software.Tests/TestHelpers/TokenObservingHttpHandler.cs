namespace Bach.Software.Tests.TestHelpers;

/// <summary>
/// A stub HTTP handler that records the cancellation token it was given and behaves as configured,
/// so tests can prove a token reached the outgoing call.
/// </summary>
public sealed class TokenObservingHttpHandler : HttpMessageHandler
{
    private readonly TaskCompletionSource _requestStarted = new(TaskCreationOptions.RunContinuationsAsynchronously);
    private readonly Func<CancellationToken, Task<HttpResponseMessage>> _behaviour;

    private TokenObservingHttpHandler(Func<CancellationToken, Task<HttpResponseMessage>> behaviour)
    {
        _behaviour = behaviour;
    }

    /// <summary>The token the handler was invoked with.</summary>
    public CancellationToken ObservedToken { get; private set; }

    /// <summary>Completes once the handler has been invoked.</summary>
    public Task RequestStarted => _requestStarted.Task;

    /// <summary>Throws when invoked with a cancelled token; otherwise answers with an empty result.</summary>
    public static TokenObservingHttpHandler ThrowsWhenCancelled() => new(token =>
    {
        token.ThrowIfCancellationRequested();
        return Task.FromResult(JsonResponse("{\"results\":[]}"));
    });

    /// <summary>Blocks until the token is cancelled, which then surfaces as a cancellation.</summary>
    public static TokenObservingHttpHandler BlocksUntilCancelled() => new(async token =>
    {
        await Task.Delay(Timeout.Infinite, token);
        throw new InvalidOperationException("Unreachable: the delay only ends by cancellation.");
    });

    /// <summary>Throws the exception as soon as it is invoked, without any token being cancelled.</summary>
    public static TokenObservingHttpHandler Throws(Exception exception) => new(_ => throw exception);

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        ObservedToken = cancellationToken;
        _requestStarted.TrySetResult();
        return _behaviour(cancellationToken);
    }

    private static HttpResponseMessage JsonResponse(string json) => new(System.Net.HttpStatusCode.OK)
    {
        Content = new StringContent(json, System.Text.Encoding.UTF8, "application/json"),
    };
}
