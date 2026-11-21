using System.Text.Json;

namespace Bach.Software.Tests.TestHelpers;

/// <summary>A problem-details response body, parsed so tests assert on values instead of raw strings.</summary>
public sealed record ProblemBody(string Raw, JsonElement Root)
{
    public const string ContentType = "application/problem+json";

    public static async Task<ProblemBody> ReadAsync(HttpResponseMessage response)
    {
        var raw = await response.Content.ReadAsStringAsync();
        using var document = JsonDocument.Parse(raw);
        return new ProblemBody(raw, document.RootElement.Clone());
    }

    public bool Has(string member) => Root.TryGetProperty(member, out _);

    public string[] Strings(string member) =>
        [.. Root.GetProperty(member).EnumerateArray().Select(item => item.GetString()!)];

    public string[] ErrorsFor(string property) => Strings("errors", property);

    private string[] Strings(string member, string property) =>
        [.. Root.GetProperty(member).GetProperty(property).EnumerateArray().Select(item => item.GetString()!)];

    /// <summary>A 5xx (or detail-free 4xx) body: a title and nothing that leaks internals.</summary>
    public void AssertDetailFree()
    {
        Assert.True(Has("title"));
        foreach (var member in new[] { "detail", "errors", "code", "placeholders", "exception", "stackTrace" })
        {
            Assert.False(Has(member), $"Unexpected member '{member}' in {Raw}");
        }

        Assert.DoesNotContain("   at ", Raw, StringComparison.Ordinal);
    }
}
