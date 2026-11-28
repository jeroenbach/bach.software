using System.Net;
using System.Text.Json;
using Bach.Software.Application.Errors;
using Bach.Software.Tests.TestHelpers;
using Microsoft.Extensions.Logging;

namespace Bach.Software.Tests.Integration;

public class AnalyticsEndpointErrorMappingTests
{
    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WhenUnclassifiedExceptionThrown_Returns500DetailFreeProblem(string route)
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClientWithFaultyAnalytics(UnclassifiedFailure.Create("sentinel-secret"));

        var response = await AnalyticsRequests.GetAsync(client, route);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal(ProblemBody.ContentType, response.Content.Headers.ContentType?.MediaType);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
        Assert.DoesNotContain("sentinel-secret", body.Raw, StringComparison.Ordinal);
        Assert.DoesNotContain(nameof(NullReferenceException), body.Raw, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData(FailureKind.Invalid, HttpStatusCode.BadRequest)]
    [InlineData(FailureKind.NotFound, HttpStatusCode.NotFound)]
    [InlineData(FailureKind.Conflict, HttpStatusCode.Conflict)]
    [InlineData(FailureKind.Unprocessable, HttpStatusCode.UnprocessableEntity)]
    public async Task GetAnalytics_WhenAppExceptionThrown_MapsKindToStatus(FailureKind kind, HttpStatusCode expectedStatus)
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClientWithFaultyAnalytics(
            AppException.Create(new ErrorCode("Test", "Case", kind, new { id = 1 })));

        var response = await AnalyticsRequests.GetAsync(client, "pageReads");

        Assert.Equal(expectedStatus, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        Assert.Equal("testCase", body.Root.GetProperty("code").GetString());
        Assert.Equal(1, body.Root.GetProperty("placeholders").GetProperty("id").GetInt32());
        Assert.DoesNotContain(factory.Logs.Entries, entry => entry.Level >= LogLevel.Error);
    }

    [Fact]
    public async Task GetAnalytics_WhenAppExceptionHasFieldErrors_ReturnsValidationProblemWithCodes()
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClientWithFaultyAnalytics(
            AppException.Create(new ErrorCode("Test", "Case"))
                .WithError(new ErrorCode("Test", "Field"), "Url"));

        var response = await AnalyticsRequests.GetAsync(client, "pageReads");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        Assert.Equal(["testField"], body.ErrorsFor("Url"));
        Assert.Equal("testCase", body.Root.GetProperty("code").GetString());
        var detail = body.Root.GetProperty("errorDetails")[0];
        Assert.Equal("testField", detail.GetProperty("code").GetString());
        Assert.Equal("Url", detail.GetProperty("field").GetString());
    }

    [Fact]
    public async Task GetAnalytics_WhenAppExceptionHasDependencyKind_Returns502DetailFree()
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClientWithFaultyAnalytics(
            AppException.Create(new ErrorCode("Test", "Case", FailureKind.Dependency, new { id = 1 })));

        var response = await AnalyticsRequests.GetAsync(client, "pageReads");

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
    }

    [Fact]
    public async Task GetAnalytics_WhenAppExceptionHasUnknownKind_Returns500WithoutCode()
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClientWithFaultyAnalytics(
            AppException.Create(new ErrorCode("Test", "Case", (FailureKind)99)));

        var response = await AnalyticsRequests.GetAsync(client, "pageReads");

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
    }

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WhenDependencyTimesOut_Returns502(string route)
    {
        using var factory = new CustomWebApplicationFactory();
        var client = factory.CreateClientWithFaultyAnalytics(new TaskCanceledException("timed out"));

        var response = await AnalyticsRequests.GetAsync(client, route);

        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
        Assert.DoesNotContain("timed out", body.Raw, StringComparison.Ordinal);
    }
}
