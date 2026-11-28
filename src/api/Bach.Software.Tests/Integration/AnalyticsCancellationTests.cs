using System.Net;
using Bach.Software.Tests.TestHelpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;

namespace Bach.Software.Tests.Integration;

public class AnalyticsCancellationTests
{
    [Fact]
    public async Task GetPageReads_ClientAbortsRequest_CancelsPlausibleCall()
    {
        using var factory = new CustomWebApplicationFactory();
        using var handler = TokenObservingHttpHandler.BlocksUntilCancelled();

        await AbortRequestInFlight(factory, handler, "pageReads");

        Assert.True(handler.ObservedToken.IsCancellationRequested);
    }

    [Fact]
    public async Task GetPageLikes_ClientAbortsRequest_CancelsPlausibleCall()
    {
        using var factory = new CustomWebApplicationFactory();
        using var handler = TokenObservingHttpHandler.BlocksUntilCancelled();

        await AbortRequestInFlight(factory, handler, "pageLikes");

        Assert.True(handler.ObservedToken.IsCancellationRequested);
    }

    [Fact]
    public async Task GetPageReads_ClientAbortsRequest_LogsNoErrorEntry()
    {
        using var factory = new CustomWebApplicationFactory();
        using var handler = TokenObservingHttpHandler.BlocksUntilCancelled();

        var response = await AbortRequestInFlight(factory, handler, "pageReads");

        Assert.DoesNotContain(factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
        Assert.True(response.StatusCode < 500);
    }

    [Fact]
    public async Task GetPageLikes_ClientAbortsRequest_LogsNoErrorEntry()
    {
        using var factory = new CustomWebApplicationFactory();
        using var handler = TokenObservingHttpHandler.BlocksUntilCancelled();

        var response = await AbortRequestInFlight(factory, handler, "pageLikes");

        Assert.DoesNotContain(factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
        Assert.True(response.StatusCode < 500);
    }

    [Fact]
    public async Task GetPageReads_PlausibleTimesOutWithoutClientAbort_Returns502AndLogsOnce()
    {
        using var factory = new CustomWebApplicationFactory();
        using var handler = TokenObservingHttpHandler.Throws(new TaskCanceledException("The request timed out."));
        using var client = CreateFactoryUsing(factory, handler).CreateClient();

        var response = await AnalyticsRequests.GetAsync(client, "pageReads");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.Single(factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
    }

    private static WebApplicationFactory<Program> CreateFactoryUsing(
        CustomWebApplicationFactory factory,
        HttpMessageHandler handler,
        Action<IServiceCollection>? configureServices = null) =>
        factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IHttpClientFactory>();
            services.AddSingleton<IHttpClientFactory>(new HandlerHttpClientFactory(handler));
            configureServices?.Invoke(services);
        }));

    // The test server reports an abort to the caller before the host has finished handling it, so
    // an outermost middleware signals when the whole pipeline (exception handling and logging
    // included) is done. Reading the logs earlier would pass vacuously.
    private static async Task<HttpResponse> AbortRequestInFlight(
        CustomWebApplicationFactory factory,
        TokenObservingHttpHandler handler,
        string route)
    {
        var pipelineCompleted = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);
        var server = CreateFactoryUsing(factory, handler, services =>
            services.AddSingleton<IStartupFilter>(new PipelineCompletionFilter(pipelineCompleted))).Server;
        HttpContext? httpContext = null;
        IHttpRequestLifetimeFeature? lifetime = null;

        var pending = server.SendAsync(context =>
        {
            httpContext = context;
            context.Request.Method = HttpMethods.Get;
            context.Request.Path = $"/api/analytics/{route}";
            context.Request.QueryString = new QueryString($"?url={Uri.EscapeDataString(AnalyticsRequests.ValidUrl)}");
            lifetime = context.Features.Get<IHttpRequestLifetimeFeature>();
        });

        await handler.RequestStarted;
        lifetime!.Abort();
        await Assert.ThrowsAsync<OperationCanceledException>(() => pending);
        await pipelineCompleted.Task;

        return httpContext!.Response;
    }

    private sealed class PipelineCompletionFilter(TaskCompletionSource completed) : IStartupFilter
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => app =>
        {
            app.Use(async (context, nextMiddleware) =>
            {
                try
                {
                    await nextMiddleware(context);
                }
                finally
                {
                    completed.TrySetResult();
                }
            });
            next(app);
        };
    }

    private sealed class HandlerHttpClientFactory(HttpMessageHandler handler) : IHttpClientFactory
    {
        public HttpClient CreateClient(string name) => new(handler, disposeHandler: false);
    }
}
