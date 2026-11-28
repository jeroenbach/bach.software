using System.Net;
using Bach.Software.Tests.TestHelpers;

namespace Bach.Software.Tests.Integration;

public class CorsErrorResponseTests
{
    private const string AllowedOrigin = "https://bach.software";

    // Two origins: the CORS middleware only adds "Vary: Origin" when more than one origin is allowed.
    private const string AllowedOrigins = AllowedOrigin + ",https://www.bach.software";

    [Theory]
    [InlineData(HttpStatusCode.BadRequest)]
    [InlineData(HttpStatusCode.InternalServerError)]
    [InlineData(HttpStatusCode.BadGateway)]
    public async Task GetAnalytics_WhenRequestFailsFromAllowedOrigin_KeepsCorsHeader(HttpStatusCode failure)
    {
        using var factory = new CustomWebApplicationFactory();
        factory.ExtraConfiguration["CORS_ALLOWED_ORIGINS"] = AllowedOrigins;

        var response = await SendFailingRequestAsync(factory, failure, AllowedOrigin);

        Assert.Equal(failure, response.StatusCode);
        Assert.Equal(AllowedOrigin, Assert.Single(response.Headers.GetValues("Access-Control-Allow-Origin")));
        Assert.Contains("Origin", response.Headers.Vary);
    }

    [Fact]
    public async Task GetAnalytics_WhenRequestFailsFromOtherOrigin_OmitsCorsHeader()
    {
        using var factory = new CustomWebApplicationFactory();
        factory.ExtraConfiguration["CORS_ALLOWED_ORIGINS"] = AllowedOrigins;

        var response = await SendFailingRequestAsync(factory, HttpStatusCode.BadGateway, "https://evil.example");

        Assert.False(response.Headers.Contains("Access-Control-Allow-Origin"));
    }

    private static Task<HttpResponseMessage> SendFailingRequestAsync(CustomWebApplicationFactory factory, HttpStatusCode failure, string origin)
    {
        var client = failure switch
        {
            HttpStatusCode.InternalServerError => factory.CreateClientWithFaultyAnalytics(UnclassifiedFailure.Create()),
            HttpStatusCode.BadGateway => factory.CreateClientWithFaultyAnalytics(new HttpRequestException()),
            _ => factory.CreateClient(),
        };

        var url = failure == HttpStatusCode.BadRequest ? "not-a-valid-url" : AnalyticsRequests.ValidUrl;
        var request = new HttpRequestMessage(HttpMethod.Get, $"/api/analytics/pageReads?url={Uri.EscapeDataString(url)}");
        request.Headers.Add("Origin", origin);

        return client.SendAsync(request);
    }
}
