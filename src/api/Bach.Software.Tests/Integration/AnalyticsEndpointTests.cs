using System.Net;
using System.Text.Json;
using Bach.Software.Tests.TestHelpers;
using Microsoft.Extensions.Logging;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests.Integration;

public class AnalyticsEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
    private static readonly int[] _openedMetrics = [42];
    private static readonly string[] _openedDimensions = ["opened"];
    private static readonly int[] _likeMetrics = [7];
    private static readonly string[] _likeDimensions = ["like"];

    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public AnalyticsEndpointTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetPageReads_WithValidUrl_ReturnsOk()
    {
        // Arrange
        var testUrl = "https://bach.software/test";

        // Mock the external HTTP call to Plausible API
        _factory.MockHttpHandler
            .When("*")
            .Respond("application/json", JsonSerializer.Serialize(new
            {
                results = new[]
                {
                    new { metrics = _openedMetrics, dimensions = _openedDimensions },
                },
            }));

        // Act
        var response = await _client.GetAsync($"/api/analytics/pageReads?url={Uri.EscapeDataString(testUrl)}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetPageReads_WithInvalidUrl_ReturnsBadRequest()
    {
        // Arrange
        var invalidUrl = "not-a-valid-url";

        // Act
        var response = await _client.GetAsync($"/api/analytics/pageReads?url={Uri.EscapeDataString(invalidUrl)}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetPageLikes_WithValidUrl_ReturnsOk()
    {
        // Arrange
        var testUrl = "https://bach.software/test";

        // Mock the external HTTP call to Plausible API
        _factory.MockHttpHandler
            .When("*")
            .Respond("application/json", JsonSerializer.Serialize(new
            {
                results = new[]
                {
                    new { metrics = _likeMetrics, dimensions = _likeDimensions },
                },
            }));

        // Act
        var response = await _client.GetAsync($"/api/analytics/pageLikes?url={Uri.EscapeDataString(testUrl)}");

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("\"likes\":7", content);
    }

    [Fact]
    public async Task GetPageLikes_WithInvalidUrl_ReturnsBadRequest()
    {
        // Arrange
        var invalidUrl = "not-a-valid-url";

        // Act
        var response = await _client.GetAsync($"/api/analytics/pageLikes?url={Uri.EscapeDataString(invalidUrl)}");

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetPageLikes_WhenPlausibleRequestFails_ReturnsBadGateway()
    {
        // Arrange
        // Use a dedicated factory: the shared MockHttpHandler keeps its responders for the
        // lifetime of the class fixture, so an error responder would leak into other tests
        using var factory = new CustomWebApplicationFactory();
        factory.MockHttpHandler
            .When("*")
            .Respond(HttpStatusCode.InternalServerError);
        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync($"/api/analytics/pageLikes?url={Uri.EscapeDataString("https://bach.software/test")}");

        // Assert
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    [Fact]
    public async Task GetPageLikes_WhenPlausibleResponseCannotBeDeserialized_ReturnsBadGateway()
    {
        // Arrange
        // Use a dedicated factory: the shared MockHttpHandler keeps its responders for the
        // lifetime of the class fixture, so this responder would leak into other tests
        using var factory = new CustomWebApplicationFactory();
        factory.MockHttpHandler
            .When("*")
            .Respond("application/json", "null");
        var client = factory.CreateClient();

        // Act
        var response = await client.GetAsync($"/api/analytics/pageLikes?url={Uri.EscapeDataString("https://bach.software/test")}");

        // Assert
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
    }

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WhenPlausibleReturnsHttpError_Returns502DetailFreeProblem(string route)
    {
        // Arrange
        using var factory = new CustomWebApplicationFactory();
        factory.MockHttpHandler.When("*").Respond(HttpStatusCode.InternalServerError);
        var client = factory.CreateClient();

        // Act
        var response = await AnalyticsRequests.GetAsync(client, route);

        // Assert
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        Assert.Equal(ProblemBody.ContentType, response.Content.Headers.ContentType?.MediaType);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
        Assert.DoesNotContain("Response status code", body.Raw, StringComparison.Ordinal);
        Assert.DoesNotContain("test-token", body.Raw, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public async Task GetAnalytics_WhenPlausibleConnectionFails_Returns502(string route)
    {
        // Arrange
        using var factory = new CustomWebApplicationFactory();
        factory.MockHttpHandler.When("*").Throw(new HttpRequestException("connection refused"));
        var client = factory.CreateClient();

        // Act
        var response = await AnalyticsRequests.GetAsync(client, route);

        // Assert
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
        Assert.DoesNotContain("connection refused", body.Raw, StringComparison.Ordinal);
    }

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public Task GetAnalytics_WhenPlausibleResponseCannotBeDeserialized_Returns502(string route) =>
        AssertUnusableResponseReturns502(route, "null");

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public Task GetAnalytics_WhenPlausibleResponseIsMalformedJson_Returns502(string route) =>
        AssertUnusableResponseReturns502(route, "not json");

    [Theory]
    [InlineData("pageReads")]
    [InlineData("pageLikes")]
    public Task GetAnalytics_WhenPlausibleResponseLacksRequiredMembers_Returns502(string route) =>
        AssertUnusableResponseReturns502(route, "{}");

    private static async Task AssertUnusableResponseReturns502(string route, string plausibleBody)
    {
        // Arrange
        using var factory = new CustomWebApplicationFactory();
        factory.MockHttpHandler.When("*").Respond("application/json", plausibleBody);
        var client = factory.CreateClient();

        // Act
        var response = await AnalyticsRequests.GetAsync(client, route);

        // Assert
        Assert.Equal(HttpStatusCode.BadGateway, response.StatusCode);
        var body = await ProblemBody.ReadAsync(response);
        body.AssertDetailFree();
        Assert.Single(factory.Logs.Entries, entry => entry.Level == LogLevel.Error);
    }
}
