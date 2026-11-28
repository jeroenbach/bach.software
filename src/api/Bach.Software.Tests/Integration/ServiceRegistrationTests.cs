using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace Bach.Software.Tests.Integration;

public class ServiceRegistrationTests
{
    /// <summary>
    /// An HttpClient captured by a singleton outlives IHttpClientFactory's handler rotation,
    /// so the process keeps one connection pool forever and the first request after an idle
    /// period can fail on a stale connection. Services that call external HTTP APIs must be
    /// registered as typed clients (AddHttpClient&lt;TInterface, TImplementation&gt;) instead.
    /// </summary>
    [Fact]
    public void NoSingletonRegistrationCapturesAnHttpClient()
    {
        IServiceCollection? services = null;
        using var baseFactory = new CustomWebApplicationFactory();
        using var factory = baseFactory.WithWebHostBuilder(builder =>
            builder.ConfigureServices(collected => services = collected));
        _ = factory.Server;

        Assert.NotNull(services);
        var offenders = services
            .Where(descriptor => descriptor.Lifetime == ServiceLifetime.Singleton)
            .Select(descriptor => descriptor.ImplementationType)
            .Where(implementationType => implementationType is not null
                && implementationType.GetConstructors()
                    .Any(ctor => ctor.GetParameters().Any(p => p.ParameterType == typeof(HttpClient))))
            .Select(implementationType => implementationType!.FullName)
            .ToList();

        Assert.Empty(offenders);
    }
}
