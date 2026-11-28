using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;

namespace Bach.Software.Tests.Integration;

/// <summary>
/// Guards the OpenAPI document contract that the Kiota client in
/// src/app/services/backend is generated from.
/// </summary>
public class OpenApiDocumentTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;
    private readonly HttpClient _client;

    public OpenApiDocumentTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
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
    public Task PageReads_DeclaresTypedResponses() => AssertDeclaresTypedResponses("pageReads", "PageReads");

    [Fact]
    public Task PageLikes_DeclaresTypedResponses() => AssertDeclaresTypedResponses("pageLikes", "PageLikes");

    [Fact]
    public Task PageReads_DoesNotDocumentCancellationToken() => AssertOnlyUrlParameterDocumented("pageReads");

    [Fact]
    public Task PageLikes_DoesNotDocumentCancellationToken() => AssertOnlyUrlParameterDocumented("pageLikes");

    private async Task AssertOnlyUrlParameterDocumented(string operationId)
    {
        using var document = await GetDocumentAsync();

        var parameters = document.RootElement
            .GetProperty("paths")
            .GetProperty($"/analytics/{operationId}")
            .GetProperty("get")
            .GetProperty("parameters");

        Assert.Equal(1, parameters.GetArrayLength());
        Assert.Equal("url", parameters[0].GetProperty("name").GetString());
    }

    private async Task AssertDeclaresTypedResponses(string operationId, string schema)
    {
        using var document = await GetDocumentAsync();

        var operation = document.RootElement
            .GetProperty("paths")
            .GetProperty($"/analytics/{operationId}")
            .GetProperty("get");

        Assert.Equal(operationId, operation.GetProperty("operationId").GetString());

        var urlParameter = operation.GetProperty("parameters")[0];
        Assert.Equal("url", urlParameter.GetProperty("name").GetString());
        Assert.True(urlParameter.GetProperty("required").GetBoolean());

        var responses = operation.GetProperty("responses");
        Assert.Equal(
            $"#/components/schemas/{schema}",
            responses.GetProperty("200").GetProperty("content").GetProperty("application/json").GetProperty("schema").GetProperty("$ref").GetString());
        Assert.Equal(
            "#/components/schemas/ValidationProblemDetails",
            responses.GetProperty("400").GetProperty("content").GetProperty("application/json").GetProperty("schema").GetProperty("$ref").GetString());
        Assert.Equal(
            "#/components/schemas/ProblemDetails",
            responses.GetProperty("500").GetProperty("content").GetProperty("application/problem+json").GetProperty("schema").GetProperty("$ref").GetString());
        Assert.Equal(
            "#/components/schemas/ProblemDetails",
            responses.GetProperty("502").GetProperty("content").GetProperty("application/problem+json").GetProperty("schema").GetProperty("$ref").GetString());
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

    [Theory]
    [InlineData("ProblemDetails")]
    [InlineData("ValidationProblemDetails")]
    public async Task ProblemDetailsSchemas_CarryTheErrorCodeContract(string schemaName)
    {
        using var document = await GetDocumentAsync();

        var schema = document.RootElement.GetProperty("components").GetProperty("schemas").GetProperty(schemaName);
        var properties = schema.GetProperty("properties");

        Assert.True(properties.TryGetProperty("code", out var code));
        Assert.True(code.GetProperty("enum").GetArrayLength() > 0);
        Assert.True(properties.TryGetProperty("placeholders", out _));
        Assert.True(schema.TryGetProperty("x-error-placeholders", out var placeholders));
        Assert.True(placeholders.EnumerateObject().Any());
    }

    [Fact]
    public async Task OpenApiDocument_IsServed_UnderANonDevelopmentEnvironment()
    {
        // MapOpenApi() must be unconditional: a consumer in another repository refreshes its
        // pinned copy from a deployed, non-Development environment (API-01).
        using var client = _factory.WithWebHostBuilder(builder => builder.UseEnvironment(Environments.Production)).CreateClient();

        var response = await client.GetAsync("/openapi/v1.json");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
