using System.Text.Json;
using Bach.Software.Core.Interfaces;
using Bach.Software.Infrastructure.Plausible.Entities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Bach.Software.Infrastructure.PlausibleAnalytics.Services;

public class PlausibleService : IAnalyticsService
{
    private const string _defaultPlausibleUrl = "https://plausible.io";
    private const string _queryUrl = "/api/v2/query";
    private readonly HttpClient _httpClient;
    private readonly string _apiUrl;
    private readonly string _apiToken;
    private readonly ILogger<PlausibleService> _logger;

    public PlausibleService(HttpClient httpClient, IConfiguration configuration, ILogger<PlausibleService> logger)
    {
        _httpClient = httpClient;
        _apiToken = configuration["PLAUSIBLE_API_TOKEN"] ?? throw new ArgumentNullException(nameof(_apiToken), "API token cannot be null");
        _apiUrl = configuration["PLAUSIBLE_API_URL"] ?? _defaultPlausibleUrl;
        _logger = logger;
    }

    public async Task<int> GetPageReads(string url)
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
                new List<object> { "is", "event:goal", new[] {"read"} },
            }
        };

        var jsonPayload = JsonSerializer.Serialize(payload);
        _logger.LogInformation("Payload: {jsonPayload}", jsonPayload);

        var response = await SendRequest(jsonPayload);
        var responseContent = await response.Content.ReadAsStringAsync();
        _logger.LogInformation("Response: {responseContent}", responseContent);

        var queryResult = JsonSerializer.Deserialize<QueryResult>(responseContent);
        if (queryResult == null)
        {
            throw new InvalidOperationException("Failed to deserialize the response content.");
        }

        return queryResult.Results.FirstOrDefault()?.Metrics.FirstOrDefault() ?? 0;
    }

    private async Task<HttpResponseMessage> SendRequest(string jsonPayload)
    {
        ArgumentNullException.ThrowIfNullOrEmpty(jsonPayload);

        var request = new HttpRequestMessage(HttpMethod.Post, $"{_apiUrl}{_queryUrl}");
        request.Headers.Add("Authorization", $"Bearer {_apiToken}");
        request.Content = new StringContent(jsonPayload, System.Text.Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        response.EnsureSuccessStatusCode();

        return response;
    }
}
