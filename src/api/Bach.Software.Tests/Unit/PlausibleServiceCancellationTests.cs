using Bach.Software.Tests.TestHelpers;

namespace Bach.Software.Tests.Unit;

public class PlausibleServiceCancellationTests
{
    private const string _pageUrl = "https://bach.software/x";

    [Fact]
    public Task GetPageReads_TokenAlreadyCancelled_ThrowsOperationCanceledException() =>
        AssertCancelledBeforeSending((service, token) => service.GetPageReads(_pageUrl, token));

    [Fact]
    public Task GetPageLikes_TokenAlreadyCancelled_ThrowsOperationCanceledException() =>
        AssertCancelledBeforeSending((service, token) => service.GetPageLikes(_pageUrl, token));

    [Fact]
    public Task GetPageReads_TokenCancelledWhileSending_ThrowsOperationCanceledException() =>
        AssertCancelledWhileSending((service, token) => service.GetPageReads(_pageUrl, token));

    [Fact]
    public Task GetPageLikes_TokenCancelledWhileSending_ThrowsOperationCanceledException() =>
        AssertCancelledWhileSending((service, token) => service.GetPageLikes(_pageUrl, token));

    private static async Task AssertCancelledBeforeSending(
        Func<Infrastructure.PlausibleAnalytics.Services.PlausibleService, CancellationToken, Task> call)
    {
        using var handler = TokenObservingHttpHandler.ThrowsWhenCancelled();
        var service = PlausibleServiceFactory.Create(handler);
        using var cancellation = new CancellationTokenSource();
        await cancellation.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => call(service, cancellation.Token));

        Assert.True(handler.ObservedToken.CanBeCanceled);
        Assert.True(handler.ObservedToken.IsCancellationRequested);
    }

    private static async Task AssertCancelledWhileSending(
        Func<Infrastructure.PlausibleAnalytics.Services.PlausibleService, CancellationToken, Task> call)
    {
        using var handler = TokenObservingHttpHandler.BlocksUntilCancelled();
        var service = PlausibleServiceFactory.Create(handler);
        using var cancellation = new CancellationTokenSource();
        var pending = call(service, cancellation.Token);
        await handler.RequestStarted;

        await cancellation.CancelAsync();

        await Assert.ThrowsAnyAsync<OperationCanceledException>(() => pending);
        Assert.True(handler.ObservedToken.CanBeCanceled);
    }
}
