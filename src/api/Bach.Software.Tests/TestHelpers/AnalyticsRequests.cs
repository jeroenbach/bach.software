namespace Bach.Software.Tests.TestHelpers;

public static class AnalyticsRequests
{
    public const string ValidUrl = "https://bach.software/test";

    public static Task<HttpResponseMessage> GetAsync(HttpClient client, string route, string url = ValidUrl) =>
        client.GetAsync($"/api/analytics/{route}?url={Uri.EscapeDataString(url)}");
}
