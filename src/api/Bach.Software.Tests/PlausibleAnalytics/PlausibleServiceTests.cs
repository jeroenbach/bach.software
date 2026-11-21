using System.Net;
using System.Text.Json;
using Bach.Software.Infrastructure.PlausibleAnalytics.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging.Abstractions;
using RichardSzalay.MockHttp;

namespace Bach.Software.Tests.PlausibleAnalytics;

public class PlausibleServiceTests
{
    private const string _apiUrl = "https://plausible.test";
    private const string _apiToken = "test-token";
    private const string _pageUrl = "https://bach.software/posts/example";

    [Fact]
    public async Task GetPageReads_WhenResultContainsEveryGoal_MapsEachMetricToItsOwnProperty()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody(
            ("read", 1), ("three-quarter-read", 2), ("half-read", 3), ("quarter-read", 4), ("peeked", 5), ("opened", 6)));
        using var httpClient = handler.ToHttpClient();

        var reads = await CreateService(httpClient).GetPageReads(_pageUrl, CancellationToken.None);

        Assert.Equal(1, reads.Read);
        Assert.Equal(2, reads.ThreeQuarterRead);
        Assert.Equal(3, reads.HalfRead);
        Assert.Equal(4, reads.QuarterRead);
        Assert.Equal(5, reads.Peeked);
        Assert.Equal(6, reads.Opened);
    }

    [Fact]
    public async Task GetPageReads_WhenResultOmitsGoals_DefaultsMissingMetricsToZero()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody(("opened", 9)));
        using var httpClient = handler.ToHttpClient();

        var reads = await CreateService(httpClient).GetPageReads(_pageUrl, CancellationToken.None);

        Assert.Equal(9, reads.Opened);
        Assert.Equal(0, reads.Read);
        Assert.Equal(0, reads.ThreeQuarterRead);
        Assert.Equal(0, reads.HalfRead);
        Assert.Equal(0, reads.QuarterRead);
        Assert.Equal(0, reads.Peeked);
    }

    [Fact]
    public async Task GetPageReads_WhenResultsAreEmpty_ReturnsAllZeros()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody());
        using var httpClient = handler.ToHttpClient();

        var reads = await CreateService(httpClient).GetPageReads(_pageUrl, CancellationToken.None);

        Assert.Equal(0, reads.Read + reads.ThreeQuarterRead + reads.HalfRead + reads.QuarterRead + reads.Peeked + reads.Opened);
    }

    [Fact]
    public async Task GetPageReads_WhenResultContainsUnknownGoal_IgnoresIt()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody(("unknown-goal", 99), ("read", 3)));
        using var httpClient = handler.ToHttpClient();

        var reads = await CreateService(httpClient).GetPageReads(_pageUrl, CancellationToken.None);

        Assert.Equal(3, reads.Read);
        Assert.Equal(0, reads.ThreeQuarterRead + reads.HalfRead + reads.QuarterRead + reads.Peeked + reads.Opened);
    }

    [Fact]
    public async Task GetPageLikes_WhenResultContainsLike_MapsLikes()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody(("like", 7)));
        using var httpClient = handler.ToHttpClient();

        var likes = await CreateService(httpClient).GetPageLikes(_pageUrl, CancellationToken.None);

        Assert.Equal(7, likes.Likes);
    }

    [Fact]
    public async Task GetPageLikes_WhenResultsAreEmpty_DefaultsToZero()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody());
        using var httpClient = handler.ToHttpClient();

        var likes = await CreateService(httpClient).GetPageLikes(_pageUrl, CancellationToken.None);

        Assert.Equal(0, likes.Likes);
    }

    [Fact]
    public async Task GetPageLikes_WhenResultHoldsOnlyAnUnrelatedGoal_DefaultsToZero()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody(("opened", 5)));
        using var httpClient = handler.ToHttpClient();

        var likes = await CreateService(httpClient).GetPageLikes(_pageUrl, CancellationToken.None);

        Assert.Equal(0, likes.Likes);
    }

    [Fact]
    public async Task GetPageLikes_WhenResultContainsLikeAndOtherGoals_MapsOnlyLikes()
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond("application/json", ResultsBody(("opened", 9), ("like", 5), ("read", 3)));
        using var httpClient = handler.ToHttpClient();

        var likes = await CreateService(httpClient).GetPageLikes(_pageUrl, CancellationToken.None);

        Assert.Equal(5, likes.Likes);
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.InternalServerError)]
    [InlineData(HttpStatusCode.ServiceUnavailable)]
    public async Task GetPageReads_WhenPlausibleReturnsNonSuccess_ThrowsHttpRequestException(HttpStatusCode statusCode)
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond(statusCode);
        using var httpClient = handler.ToHttpClient();

        var exception = await Assert.ThrowsAsync<HttpRequestException>(
            () => CreateService(httpClient).GetPageReads(_pageUrl, CancellationToken.None));

        Assert.Equal(statusCode, exception.StatusCode);
    }

    [Theory]
    [InlineData(HttpStatusCode.Unauthorized)]
    [InlineData(HttpStatusCode.TooManyRequests)]
    [InlineData(HttpStatusCode.InternalServerError)]
    [InlineData(HttpStatusCode.ServiceUnavailable)]
    public async Task GetPageLikes_WhenPlausibleReturnsNonSuccess_ThrowsHttpRequestException(HttpStatusCode statusCode)
    {
        using var handler = new MockHttpMessageHandler();
        handler.When("*").Respond(statusCode);
        using var httpClient = handler.ToHttpClient();

        var exception = await Assert.ThrowsAsync<HttpRequestException>(
            () => CreateService(httpClient).GetPageLikes(_pageUrl, CancellationToken.None));

        Assert.Equal(statusCode, exception.StatusCode);
    }

    [Fact]
    public async Task GetPageReads_WithValidUrl_PostsQueryWithBearerTokenSiteIdAndReadGoals()
    {
        using var handler = new MockHttpMessageHandler();
        var expected = handler
            .Expect(HttpMethod.Post, $"{_apiUrl}/api/v2/query")
            .WithHeaders("Authorization", $"Bearer {_apiToken}")
            .WithPartialContent("\"site_id\":\"bach.software\"")
            .WithPartialContent("\"contains\",\"event:page\",[\"/posts/example\"]")
            .WithPartialContent("\"event:goal\",[\"read\",\"three-quarter-read\",\"half-read\",\"quarter-read\",\"peeked\",\"opened\"]")
            .Respond("application/json", ResultsBody());
        using var httpClient = handler.ToHttpClient();

        await CreateService(httpClient).GetPageReads(_pageUrl, CancellationToken.None);

        handler.VerifyNoOutstandingExpectation();
        Assert.Equal(1, handler.GetMatchCount(expected));
    }

    [Fact]
    public async Task GetPageLikes_WithValidUrl_PostsQueryWithBearerTokenSiteIdAndLikeGoal()
    {
        using var handler = new MockHttpMessageHandler();
        var expected = handler
            .Expect(HttpMethod.Post, $"{_apiUrl}/api/v2/query")
            .WithHeaders("Authorization", $"Bearer {_apiToken}")
            .WithPartialContent("\"site_id\":\"bach.software\"")
            .WithPartialContent("\"contains\",\"event:page\",[\"/posts/example\"]")
            .WithPartialContent("\"event:goal\",[\"like\"]")
            .Respond("application/json", ResultsBody());
        using var httpClient = handler.ToHttpClient();

        await CreateService(httpClient).GetPageLikes(_pageUrl, CancellationToken.None);

        handler.VerifyNoOutstandingExpectation();
        Assert.Equal(1, handler.GetMatchCount(expected));
    }

    [Fact]
    public async Task GetPageReads_WithoutApiUrlConfigured_UsesDefaultPlausibleHost()
    {
        using var handler = new MockHttpMessageHandler();
        handler.Expect(HttpMethod.Post, "https://plausible.io/api/v2/query")
            .Respond("application/json", ResultsBody());
        using var httpClient = handler.ToHttpClient();
        var service = new PlausibleService(
            httpClient,
            BuildConfiguration(new Dictionary<string, string?> { ["PLAUSIBLE_API_TOKEN"] = _apiToken }),
            NullLogger<PlausibleService>.Instance);

        await service.GetPageReads(_pageUrl, CancellationToken.None);

        handler.VerifyNoOutstandingExpectation();
    }

    [Fact]
    public void Constructor_WithoutApiToken_ThrowsInvalidOperationException()
    {
        using var httpClient = new HttpClient(new MockHttpMessageHandler());

        Assert.Throws<InvalidOperationException>(() => new PlausibleService(
            httpClient,
            BuildConfiguration([]),
            NullLogger<PlausibleService>.Instance));
    }

    private static PlausibleService CreateService(HttpClient httpClient) => new(
        httpClient,
        BuildConfiguration(new Dictionary<string, string?>
        {
            ["PLAUSIBLE_API_TOKEN"] = _apiToken,
            ["PLAUSIBLE_API_URL"] = _apiUrl,
        }),
        NullLogger<PlausibleService>.Instance);

    private static IConfiguration BuildConfiguration(Dictionary<string, string?> values) =>
        new ConfigurationBuilder().AddInMemoryCollection(values).Build();

    private static string ResultsBody(params (string Goal, int Visitors)[] entries) =>
        JsonSerializer.Serialize(new
        {
            results = entries.Select(entry => new
            {
                metrics = new[] { entry.Visitors },
                dimensions = new[] { entry.Goal },
            }),
        });
}
