using Bach.Software.Infrastructure.PlausibleAnalytics.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;

namespace Bach.Software.Tests.TestHelpers;

public static class PlausibleServiceFactory
{
    /// <summary>Builds a service that talks to the given handler instead of the network.</summary>
    public static PlausibleService Create(HttpMessageHandler handler)
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["PLAUSIBLE_API_TOKEN"] = "test-token" })
            .Build();

        return new PlausibleService(new HttpClient(handler), configuration, NullLogger<PlausibleService>.Instance);
    }
}
