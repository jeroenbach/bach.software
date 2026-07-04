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
}
