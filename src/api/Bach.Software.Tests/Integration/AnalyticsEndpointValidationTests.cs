using System.Net;
using Bach.Software.Tests.TestHelpers;

namespace Bach.Software.Tests.Integration;

public class AnalyticsEndpointValidationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public AnalyticsEndpointValidationTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WithEmptyUrl_Returns400WithErrorCodes(string route)
    {
        var response = await AnalyticsRequests.GetAsync(_client, route, string.Empty);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        Assert.Contains("urlRequired", body.ErrorsFor("Url"));
        Assert.DoesNotContain("URL is required", body.Raw, StringComparison.Ordinal);
        Assert.DoesNotContain("must not be empty", body.Raw, StringComparison.Ordinal);
        Assert.DoesNotContain("must be a valid", body.Raw, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("pageReads", "not-a-valid-url")]
    [InlineData("pageLikes", "not-a-valid-url")]
    [InlineData("pageReads", "ftp://bach.software/x")]
    [InlineData("pageLikes", "/relative/path")]
    public async Task GetAnalytics_WithNonHttpUrl_Returns400WithUrlInvalid(string route, string url)
    {
        var response = await AnalyticsRequests.GetAsync(_client, route, url);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        Assert.Equal(["urlInvalid"], body.ErrorsFor("Url"));
        Assert.DoesNotContain("must be a valid", body.Raw, StringComparison.Ordinal);
    }

    [Fact]
    public async Task GetAnalytics_WithMultipleFailuresOnOneProperty_KeepsAllCodes()
    {
        var response = await AnalyticsRequests.GetAsync(_client, "pageReads", string.Empty);

        var body = await ProblemBody.ReadAsync(response);
        Assert.Equal(["urlRequired", "urlInvalid"], body.ErrorsFor("Url"));
    }

    [Fact]
    public async Task GetAnalytics_WithValidationFailure_ReturnsProblemJsonContentType()
    {
        var response = await AnalyticsRequests.GetAsync(_client, "pageReads", "not-a-valid-url");

        Assert.Equal(ProblemBody.ContentType, response.Content.Headers.ContentType?.MediaType);
    }

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WithMissingUrlParameter_Returns400NotServerError(string route)
    {
        var response = await _client.GetAsync($"/api/analytics/{route}");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
    }
}
