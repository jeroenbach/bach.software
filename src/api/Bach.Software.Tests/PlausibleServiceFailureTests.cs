using Bach.Software.Application.Errors;
using Bach.Software.Infrastructure.PlausibleAnalytics;
using Bach.Software.Infrastructure.PlausibleAnalytics.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests;

public class PlausibleServiceFailureTests
{
    [Fact]
    public Task GetPageReads_WhenResponseDeserializesToNull_ThrowsDependencyResponseException() =>
        AssertDependencyFailure("null", service => service.GetPageReads("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageReads_WhenResponseIsMalformedJson_ThrowsDependencyResponseException() =>
        AssertDependencyFailure("not json", service => service.GetPageReads("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageReads_WhenResponseLacksRequiredMembers_ThrowsDependencyResponseException() =>
        AssertDependencyFailure("{}", service => service.GetPageReads("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageLikes_WhenResponseDeserializesToNull_ThrowsDependencyResponseException() =>
        AssertDependencyFailure("null", service => service.GetPageLikes("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageLikes_WhenResponseIsMalformedJson_ThrowsDependencyResponseException() =>
        AssertDependencyFailure("not json", service => service.GetPageLikes("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageLikes_WhenResponseLacksRequiredMembers_ThrowsDependencyResponseException() =>
        AssertDependencyFailure("{}", service => service.GetPageLikes("https://bach.software/x", CancellationToken.None));

    private static async Task AssertDependencyFailure(string plausibleBody, Func<PlausibleService, Task> call)
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", plausibleBody);
        using var httpClient = handler.ToHttpClient();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["PLAUSIBLE_API_TOKEN"] = "test-token" })
            .Build();
        var service = new PlausibleService(httpClient, configuration, NullLogger<PlausibleService>.Instance);

        var exception = await Record.ExceptionAsync(() => call(service));

        Assert.IsType<PlausibleResponseException>(exception);
        Assert.IsNotType<AppException>(exception);
        Assert.IsNotType<InvalidOperationException>(exception);
    }
}
