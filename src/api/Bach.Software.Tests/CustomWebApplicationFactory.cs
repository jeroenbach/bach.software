using Bach.Software.Application.Interfaces;
using Bach.Software.Tests.TestHelpers;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public MockHttpMessageHandler MockHttpHandler { get; } = new();

    /// <summary>Every log entry written by the host, across all categories.</summary>
    public CapturingLoggerProvider Logs { get; } = new();

    /// <summary>Extra configuration values; set them before the first client or service is requested.</summary>
    public Dictionary<string, string?> ExtraConfiguration { get; } = [];

    /// <summary>Creates a client for a host whose analytics service throws the given exception.</summary>
    public HttpClient CreateClientWithFaultyAnalytics(Exception exception) =>
        WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.RemoveAll<IAnalyticsService>();
            services.AddSingleton<IAnalyticsService>(new FaultyAnalyticsService(exception));
        })).CreateClient();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["PLAUSIBLE_API_TOKEN"] = "test-token",
            });
        });

        // UseSetting rather than in-memory configuration: CORS_ALLOWED_ORIGINS is read while the
        // services are registered, before the in-memory configuration is applied.
        foreach (var (key, value) in ExtraConfiguration)
        {
            builder.UseSetting(key, value);
        }

        builder.ConfigureLogging(logging => logging.AddProvider(Logs));

        builder.ConfigureServices(services =>
        {
            // Remove the real HttpClient registration
            var httpClientDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IHttpClientFactory));
            if (httpClientDescriptor != null)
            {
                services.Remove(httpClientDescriptor);
            }

            // Add mock HttpClient
            services.AddSingleton<IHttpClientFactory>(sp =>
            {
                var mockFactory = new MockHttpClientFactory(MockHttpHandler);
                return mockFactory;
            });
        });
    }
}

public class MockHttpClientFactory : IHttpClientFactory
{
    private readonly MockHttpMessageHandler _handler;

    public MockHttpClientFactory(MockHttpMessageHandler handler)
    {
        _handler = handler;
    }

    public HttpClient CreateClient(string name)
    {
        return _handler.ToHttpClient();
    }
}
