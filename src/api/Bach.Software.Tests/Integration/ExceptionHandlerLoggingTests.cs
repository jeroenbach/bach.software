using Bach.Software.Tests.TestHelpers;
using Bach.Software.Web.ErrorHandling;
using Microsoft.Extensions.Logging;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests.Integration;

public class ExceptionHandlerLoggingTests
{
    private static readonly string _handlerCategory = typeof(ProblemDetailsExceptionHandler).FullName!;

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WhenPlausibleFails_LogsExactlyOneError(string route)
    {
        using var factory = new CustomWebApplicationFactory();
        factory.MockHttpHandler.When("*").Respond(System.Net.HttpStatusCode.InternalServerError);
        var client = factory.CreateClient();

        await AnalyticsRequests.GetAsync(client, route);

        var error = Assert.Single(factory.Logs.Entries, entry => entry.Level == LogLevel.Error);
        Assert.Equal(_handlerCategory, error.Category);
        Assert.IsType<HttpRequestException>(error.Exception);
    }

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WhenUnclassifiedExceptionThrown_LogsExactlyOneError(string route)
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClientWithFaultyAnalytics(UnclassifiedFailure.Create());

        await AnalyticsRequests.GetAsync(client, route);

        var error = Assert.Single(factory.Logs.Entries, entry => entry.Level == LogLevel.Error);
        Assert.Equal(_handlerCategory, error.Category);
        Assert.IsType<NullReferenceException>(error.Exception);
    }

    [Fact]
    public async Task GetAnalytics_WhenRequestIsInvalid_LogsAWarningNotAnError()
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClient();

        await AnalyticsRequests.GetAsync(client, "pageReads", "not-a-valid-url");

        Assert.DoesNotContain(factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
        Assert.Single(factory.Logs.Entries, entry => entry.Level == LogLevel.Warning && entry.Category == _handlerCategory);
    }
}
