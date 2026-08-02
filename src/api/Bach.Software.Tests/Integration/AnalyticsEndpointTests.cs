using System.Net;
using System.Text.Json;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests.Integration;

public class AnalyticsEndpointTests : IClassFixture<CustomWebApplicationFactory>
{
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
                    new { metrics = new[] { 42 }, dimensions = new[] { "opened" } },
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
                    new { metrics = new[] { 7 }, dimensions = new[] { "like" } },
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
    public async Task GetPageLikes_WhenPlausibleRequestFails_ReturnsInternalServerError()
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
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }

    [Fact]
    public async Task GetPageLikes_WhenPlausibleResponseCannotBeDeserialized_ReturnsInternalServerError()
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
        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
    }
}
