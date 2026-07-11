using System.Net;
using System.Text.Json;

namespace Bach.Software.Tests.Integration;

/// <summary>
/// Guards the OpenAPI document contract that the Kiota client in
/// src/app/services/backend is generated from.
/// </summary>
public class OpenApiDocumentTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;

    public OpenApiDocumentTests(CustomWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    private async Task<JsonDocument> GetDocumentAsync()
    {
        var response = await _client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return JsonDocument.Parse(await response.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Document_UsesApiServerWithUnprefixedPaths()
    {
        using var document = await GetDocumentAsync();

        var servers = document.RootElement.GetProperty("servers");
        Assert.Equal("/api", servers[0].GetProperty("url").GetString());

        var paths = document.RootElement.GetProperty("paths");
        Assert.True(paths.TryGetProperty("/health", out _));
        Assert.True(paths.TryGetProperty("/analytics/pageReads", out _));
    }

    [Fact]
    public async Task PageReads_DeclaresTypedResponses()
    {
        using var document = await GetDocumentAsync();

        var operation = document.RootElement
            .GetProperty("paths")
            .GetProperty("/analytics/pageReads")
            .GetProperty("get");

        Assert.Equal("pageReads", operation.GetProperty("operationId").GetString());

        var urlParameter = operation.GetProperty("parameters")[0];
        Assert.Equal("url", urlParameter.GetProperty("name").GetString());
        Assert.True(urlParameter.GetProperty("required").GetBoolean());

        var responses = operation.GetProperty("responses");
        Assert.Equal(
            "#/components/schemas/PageReads",
            responses.GetProperty("200").GetProperty("content").GetProperty("application/json").GetProperty("schema").GetProperty("$ref").GetString());
        Assert.Equal(
            "#/components/schemas/ValidationProblemDetails",
            responses.GetProperty("400").GetProperty("content").GetProperty("application/json").GetProperty("schema").GetProperty("$ref").GetString());
        Assert.Equal(
            "#/components/schemas/ProblemDetails",
            responses.GetProperty("500").GetProperty("content").GetProperty("application/problem+json").GetProperty("schema").GetProperty("$ref").GetString());
    }

    [Fact]
    public async Task Components_ContainResponseSchemas()
    {
        using var document = await GetDocumentAsync();

        var schemas = document.RootElement.GetProperty("components").GetProperty("schemas");
        Assert.True(schemas.TryGetProperty("PageReads", out var pageReads));
        Assert.True(schemas.TryGetProperty("ProblemDetails", out _));
        Assert.True(schemas.TryGetProperty("ValidationProblemDetails", out _));

        Assert.True(pageReads.GetProperty("properties").TryGetProperty("read", out _));
    }
}
