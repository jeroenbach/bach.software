using System.Net;
using System.Text.Json;

namespace Bach.Software.Tests.Integration;

/// <summary>
/// Guards the committed openapi/v1.json, the file the Kiota client is generated from,
/// against drifting from the document the running app serves.
/// </summary>
public class CommittedOpenApiDocumentTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public CommittedOpenApiDocumentTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public void CommittedDocument_WhenRead_UsesApiServerWithUnprefixedPaths()
    {
        using var document = ReadCommittedDocument();

        var servers = document.RootElement.GetProperty("servers");
        Assert.Equal("/api", servers[0].GetProperty("url").GetString());

        var paths = document.RootElement.GetProperty("paths");
        Assert.True(paths.TryGetProperty("/health", out _));
        Assert.True(paths.TryGetProperty("/analytics/pageReads", out _));
        Assert.True(paths.TryGetProperty("/analytics/pageLikes", out _));
        Assert.DoesNotContain(paths.EnumerateObject(), path => path.Name.StartsWith("/api", StringComparison.Ordinal));
    }

    [Fact]
    public void CommittedDocument_PageReads_DeclaresValidationAndServerFailureProblemSchemas() =>
        AssertDeclaresProblemSchemas("pageReads");

    [Fact]
    public void CommittedDocument_PageLikes_DeclaresValidationAndServerFailureProblemSchemas() =>
        AssertDeclaresProblemSchemas("pageLikes");

    [Fact]
    public async Task CommittedDocument_WhenComparedToRuntimeDocument_IsEquivalent()
    {
        var response = await _client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        using var runtime = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        using var committed = ReadCommittedDocument();

        Assert.Equal(DescribeOperations(runtime), DescribeOperations(committed));
        Assert.Equal(SchemaNames(runtime), SchemaNames(committed));
    }

    private static void AssertDeclaresProblemSchemas(string operationId)
    {
        using var document = ReadCommittedDocument();

        var responses = document.RootElement
            .GetProperty("paths")
            .GetProperty($"/analytics/{operationId}")
            .GetProperty("get")
            .GetProperty("responses");

        Assert.Equal("#/components/schemas/ValidationProblemDetails", SchemaRef(responses, "400"));
        Assert.Equal("#/components/schemas/ProblemDetails", SchemaRef(responses, "500"));
        Assert.Equal("#/components/schemas/ProblemDetails", SchemaRef(responses, "502"));
    }

    private static string? SchemaRef(JsonElement responses, string status)
    {
        var content = responses.GetProperty(status).GetProperty("content");
        var media = content.EnumerateObject().Single().Value;
        return media.GetProperty("schema").GetProperty("$ref").GetString();
    }

    private static List<string> DescribeOperations(JsonDocument document) =>
        [.. document.RootElement.GetProperty("paths").EnumerateObject()
            .SelectMany(path => path.Value.EnumerateObject().Select(operation =>
                $"{operation.Name.ToUpperInvariant()} {path.Name}: "
                + string.Join(",", operation.Value.GetProperty("responses").EnumerateObject().Select(r => r.Name).Order(StringComparer.Ordinal))))
            .Order(StringComparer.Ordinal)];

    private static List<string> SchemaNames(JsonDocument document) =>
        [.. document.RootElement.GetProperty("components").GetProperty("schemas").EnumerateObject()
            .Select(schema => schema.Name)
            .Order(StringComparer.Ordinal)];

    private static JsonDocument ReadCommittedDocument() =>
        JsonDocument.Parse(File.ReadAllText(Path.Combine(FindRepositoryRoot(), "openapi", "v1.json")));

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null
            && !(Directory.Exists(Path.Combine(directory.FullName, "openapi"))
                && Directory.Exists(Path.Combine(directory.FullName, "src", "api"))))
        {
            directory = directory.Parent;
        }

        return directory?.FullName
            ?? throw new InvalidOperationException("Repository root (a folder containing openapi/ and src/api/) not found.");
    }
}
