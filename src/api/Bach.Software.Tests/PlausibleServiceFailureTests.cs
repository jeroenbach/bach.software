using System.Text.Json;
using Bach.Software.Application.Errors;
using Bach.Software.Infrastructure.PlausibleAnalytics.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests;

public class PlausibleServiceFailureTests
{
    [Fact]
    public Task GetPageReads_WhenResponseDeserializesToNull_ThrowsDependencyFailure() =>
        AssertDependencyFailure("null", expectsJsonInner: false, service => service.GetPageReads("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageReads_WhenResponseIsMalformedJson_ThrowsDependencyFailure() =>
        AssertDependencyFailure("not json", expectsJsonInner: true, service => service.GetPageReads("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageReads_WhenResponseLacksRequiredMembers_ThrowsDependencyFailure() =>
        AssertDependencyFailure("{}", expectsJsonInner: true, service => service.GetPageReads("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageLikes_WhenResponseDeserializesToNull_ThrowsDependencyFailure() =>
        AssertDependencyFailure("null", expectsJsonInner: false, service => service.GetPageLikes("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageLikes_WhenResponseIsMalformedJson_ThrowsDependencyFailure() =>
        AssertDependencyFailure("not json", expectsJsonInner: true, service => service.GetPageLikes("https://bach.software/x", CancellationToken.None));

    [Fact]
    public Task GetPageLikes_WhenResponseLacksRequiredMembers_ThrowsDependencyFailure() =>
        AssertDependencyFailure("{}", expectsJsonInner: true, service => service.GetPageLikes("https://bach.software/x", CancellationToken.None));

    private static async Task AssertDependencyFailure(string plausibleBody, bool expectsJsonInner, Func<PlausibleService, Task> call)
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", plausibleBody);
        using var httpClient = handler.ToHttpClient();
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?> { ["PLAUSIBLE_API_TOKEN"] = "test-token" })
            .Build();
        var service = new PlausibleService(httpClient, configuration, NullLogger<PlausibleService>.Instance);

        var exception = Assert.IsType<AppException>(await Record.ExceptionAsync(() => call(service)));

        Assert.Equal(FailureKind.Dependency, exception.Error.Kind);
        Assert.Equal(ErrorCodes.Analytics.ResponseInvalid().Code, exception.Error.Code);
        if (expectsJsonInner)
        {
            // The parse failure stays diagnosable: the original exception rides along in the log.
            Assert.IsAssignableFrom<JsonException>(exception.InnerException);
        }
    }
}
