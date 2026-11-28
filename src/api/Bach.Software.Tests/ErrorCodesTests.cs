using System.Reflection;
using System.Text.Json;
using Bach.Software.Application.Errors;

namespace Bach.Software.Tests;

/// <summary>
/// Guards the error-code contract mechanism. The contract itself lives in the OpenAPI document:
/// ErrorCodesDocumentTransformer publishes the catalog into it, build-time generation commits
/// it under openapi/, and CI fails when the committed copy is stale (API-01), so there is no
/// sync test against a separate frontend file anymore. What can still break silently is the
/// mechanism: a duplicate code, or the transformer or MapOpenApi() dropping out of the pipeline.
/// These tests pin exactly that. The frontend's own gate is errorCodes.contract.spec.ts: it
/// walks the committed document and fails on codes without a translation and on placeholder
/// mismatches.
/// </summary>
public class ErrorCodesTests(CustomWebApplicationFactory factory) : IClassFixture<CustomWebApplicationFactory>
{
    [Fact]
    public void Error_codes_are_unique_across_groups()
    {
        Assert.Empty(ErrorCodeCatalog.DuplicateCodes(typeof(ErrorCodes)));
    }

    [Fact]
    public async Task OpenApi_document_is_served_and_carries_the_client_visible_codes()
    {
        using var client = factory.CreateClient();

        // Pins MapOpenApi() itself: every deployment serves the contract it was built with,
        // which is how a consumer in another repository refreshes its pinned copy (API-01).
        var response = await client.GetAsync("/openapi/v1.json");
        response.EnsureSuccessStatusCode();

        using var document = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var problemDetails = document.RootElement
            .GetProperty("components").GetProperty("schemas").GetProperty("ProblemDetails");

        var servedCodes = problemDetails
            .GetProperty("properties").GetProperty("code").GetProperty("enum")
            .EnumerateArray().Select(value => value.GetString()!).ToList();
        var servedPlaceholders = problemDetails.GetProperty("x-error-placeholders")
            .EnumerateObject().ToDictionary(
                property => property.Name,
                property => property.Value.EnumerateArray().Select(value => value.GetString()!).ToList());

        var catalog = ErrorCodeCatalog.ClientVisibleCodes(typeof(ErrorCodes));

        // Exact match in both directions: a code missing here means the transformer is no
        // longer registered; an extra one means a stale document or a derivation mismatch.
        Assert.Equal(catalog.Select(entry => entry.Code), servedCodes);
        Assert.Equal(
            catalog.ToDictionary(entry => entry.Code, entry => entry.Placeholders.ToList()),
            servedPlaceholders);
    }

    [Fact]
    public void Error_codes_list_the_url_validation_codes()
    {
        var map = ErrorCodeCatalog.ClientVisibleCodes(typeof(ErrorCodes))
            .ToDictionary(entry => entry.Code, entry => entry.Placeholders);

        Assert.Empty(map["urlRequired"]);
        Assert.Empty(map["urlInvalid"]);
    }

    [Fact]
    public void Dependency_codes_stay_out_of_the_published_contract()
    {
        var visible = ErrorCodeCatalog.ClientVisibleCodes(typeof(ErrorCodes)).Select(entry => entry.Code);

        // A dependency failure is a detail-free 502; its code never reaches the client,
        // so the frontend must not be forced to translate it.
        Assert.DoesNotContain(ErrorCodes.Analytics.ResponseInvalid().Code, visible);
    }

    [Fact]
    public void Placeholder_parameters_use_presentation_safe_types()
    {
        // Placeholders are interpolated into translated copy as-is, and the anonymous-object
        // idiom cannot constrain their types at compile time. Dates, decimals, and Guids
        // serialize fine but make locale-hostile sentences (raw ISO timestamps, unformatted
        // amounts), so a factory that needs one must consciously pre-format it into a string
        // instead of letting the raw value slip through to the visitor.
        Type[] allowed = [typeof(string), typeof(int), typeof(long), typeof(bool)];

        var offending = typeof(ErrorCodes)
            .GetNestedTypes(BindingFlags.Public)
            .SelectMany(group => group.GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.DeclaredOnly))
            .Where(method => method.ReturnType == typeof(ErrorCode))
            .SelectMany(method => method.GetParameters(), (method, parameter) => (method, parameter))
            .Where(entry => !allowed.Contains(entry.parameter.ParameterType))
            .Select(entry => $"{entry.method.DeclaringType!.Name}.{entry.method.Name}({entry.parameter.Name}: {entry.parameter.ParameterType.Name})")
            .ToList();

        Assert.Empty(offending);
    }

    [Fact]
    public void Error_codes_with_colliding_wire_code_are_reported()
    {
        var duplicates = ErrorCodeCatalog.DuplicateCodes(typeof(CollidingCatalog));

        Assert.Equal(["abC"], duplicates);
    }

    // Two different group/method pairs that derive the same wire code ("abC"); the only
    // fixture that proves the uniqueness check actually fires on a real collision.
    private static class CollidingCatalog
    {
#pragma warning disable CA1034, CA1724 // Nested static classes mirror the shape of the real catalog.
        public static class Ab
        {
            public static ErrorCode C() => new(nameof(Ab), nameof(C));
        }

        public static class A
        {
            public static ErrorCode bC() => new(nameof(A), nameof(bC));
        }
#pragma warning restore CA1034, CA1724
    }
}
