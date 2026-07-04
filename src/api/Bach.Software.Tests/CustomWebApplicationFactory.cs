using Bach.Software.Application.Interfaces;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests;

public class CustomWebApplicationFactory : WebApplicationFactory<Program>
{
    public MockHttpMessageHandler MockHttpHandler { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["PLAUSIBLE_API_TOKEN"] = "test-token",
            });
        });

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
