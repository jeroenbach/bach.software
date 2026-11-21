using System.Text.Json;
using Bach.Software.Application.Interfaces;
using Bach.Software.Application.Models;
using Bach.Software.Infrastructure.Plausible.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Bach.Software.Infrastructure.PlausibleAnalytics.Services;

public partial class PlausibleService : IAnalyticsService
{
    private const string _defaultPlausibleUrl = "https://plausible.io";
    private const string _queryUrl = "/api/v2/query";
    private static readonly string[] _readGoals = ["read", "three-quarter-read", "half-read", "quarter-read", "peeked", "opened"];
    private static readonly string[] _likeGoals = ["like"];
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _apiToken;
    private readonly ILogger<PlausibleService> _logger;

    public PlausibleService(HttpClient httpClient, IConfiguration configuration, ILogger<PlausibleService> logger)
    {
        _httpClient = httpClient;
        _apiToken = configuration["PLAUSIBLE_API_TOKEN"] ?? throw new InvalidOperationException("PLAUSIBLE_API_TOKEN configuration value is required.");
        _apiUrl = configuration["PLAUSIBLE_API_URL"] ?? _defaultPlausibleUrl;
        _logger = logger;
    }

    [LoggerMessage(Level = LogLevel.Information, Message = "Payload: {JsonPayload}")]
    private partial void LogPayload(string jsonPayload);

    [LoggerMessage(Level = LogLevel.Information, Message = "Response: {ResponseContent}")]
    private partial void LogResponse(string responseContent);

    public async Task<PageReads> GetPageReads(string url, CancellationToken cancellationToken)
    {
        using var scope = _logger.BeginScope(new Dictionary<string, object> { { "url", url } });

        var uri = new Uri(url);
        var domain = uri.Host;
        var relativeUrl = uri.PathAndQuery;

        var payload = new
        {
            site_id = domain,
            metrics = new[] { "visitors" }, // Get the unique number of Reading events
            date_range = "all",
            filters = new[]{
                new List<object> { "contains", "event:page", new[] { relativeUrl } },
                new List<object> { "is", "event:goal", _readGoals },
            },
            dimensions = new[] { "event:goal" },
        };

        var jsonPayload = JsonSerializer.Serialize(payload);
        LogPayload(jsonPayload);

        var response = await SendRequest(jsonPayload, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
        LogResponse(responseContent);

        var queryResult = ParseQueryResult(responseContent);

        var resultsDict = queryResult.Results.ToDictionary(x => x.Dimensions.First(), x => x.Metrics.First());

        return new PageReads
        {
            Read = resultsDict.GetValueOrDefault("read"),
            ThreeQuarterRead = resultsDict.GetValueOrDefault("three-quarter-read"),
            HalfRead = resultsDict.GetValueOrDefault("half-read"),
            QuarterRead = resultsDict.GetValueOrDefault("quarter-read"),
            Peeked = resultsDict.GetValueOrDefault("peeked"),
            Opened = resultsDict.GetValueOrDefault("opened"),
        };
    }

    public async Task<PageLikes> GetPageLikes(string url, CancellationToken cancellationToken)
    {
        using var scope = _logger.BeginScope(new Dictionary<string, object> { { "url", url } });

        var uri = new Uri(url);
        var domain = uri.Host;
        var relativeUrl = uri.PathAndQuery;

        var payload = new
        {
            site_id = domain,
            metrics = new[] { "visitors" }, // Get the unique number of Like events
            date_range = "all",
            filters = new[]{
                new List<object> { "contains", "event:page", new[] { relativeUrl } },
                new List<object> { "is", "event:goal", _likeGoals },
            },
            dimensions = new[] { "event:goal" },
        };

        var jsonPayload = JsonSerializer.Serialize(payload);
        LogPayload(jsonPayload);

        var response = await SendRequest(jsonPayload, cancellationToken);
        var responseContent = await response.Content.ReadAsStringAsync(cancellationToken);
        LogResponse(responseContent);

        var queryResult = ParseQueryResult(responseContent);

        var resultsDict = queryResult.Results.ToDictionary(x => x.Dimensions.First(), x => x.Metrics.First());

        return new PageLikes
        {
            Likes = resultsDict.GetValueOrDefault("like"),
        };
    }

    private static QueryResult ParseQueryResult(string responseContent)
    {
        try
        {
            return JsonSerializer.Deserialize<QueryResult>(responseContent)
                ?? throw new PlausibleResponseException("The Plausible response deserialized to null.");
        }
        catch (JsonException ex)
        {
            throw new PlausibleResponseException("The Plausible response could not be parsed.", ex);
        }
    }

    private async Task<HttpResponseMessage> SendRequest(string jsonPayload, CancellationToken cancellationToken)
    {
        ArgumentNullException.ThrowIfNullOrEmpty(jsonPayload);

        var request = new HttpRequestMessage(HttpMethod.Post, $"{_apiUrl}{_queryUrl}");
        request.Headers.Add("Authorization", $"Bearer {_apiToken}");
        request.Content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request, cancellationToken);
        response.EnsureSuccessStatusCode();

        return response;
    }
}
