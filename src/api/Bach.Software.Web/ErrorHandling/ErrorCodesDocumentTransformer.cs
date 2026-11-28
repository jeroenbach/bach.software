using Bach.Software.Application.Errors;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Any;
using Microsoft.OpenApi.Models;

namespace Bach.Software.Web.ErrorHandling;

/// <summary>
/// Publishes the <see cref="ErrorCodes"/> catalog into the OpenAPI document, so the document is
/// the single contract artifact for errors too: every problem-details schema gains a
/// <c>code</c> property whose enum lists every client-visible code, a <c>placeholders</c>
/// property, and an <c>x-error-placeholders</c> extension mapping each code to the placeholder
/// names its factory declares. Codes and placeholders come from <see cref="ErrorCodeCatalog"/>,
/// so the document cannot drift from the catalog. Only client-visible kinds are published: a
/// kind-<see cref="FailureKind.Dependency"/> code maps to a detail-free 502 and never reaches the
/// client, so the frontend must not be forced to translate it.
/// </summary>
/// <remarks>
/// Implemented as a schema transformer, not a document transformer: at the point document
/// transformers run, response schemas are still generated inline per operation and have not yet
/// been hoisted into <c>document.Components.Schemas</c>, so mutating that dictionary there has
/// no effect (verified against this project's Microsoft.AspNetCore.OpenApi 9.0.6). A schema
/// transformer mutates the schema object itself as it is built, before hoisting, which does land
/// in the final document. Registered in <c>OpenApiExtensions.AddBachSoftwareOpenApi</c>.
/// </remarks>
public sealed class ErrorCodesDocumentTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(OpenApiSchema schema, OpenApiSchemaTransformerContext context, CancellationToken cancellationToken)
    {
        // Every problem-details type carries the contract: the plain one (ProblemDetails) and
        // the validation one (ValidationProblemDetails, field-scoped batch failures). Matched by
        // type-name suffix rather than a hardcoded pair, so a differently-named validation type
        // still gets enriched.
        if (!context.JsonTypeInfo.Type.Name.EndsWith("ProblemDetails", StringComparison.Ordinal))
        {
            return Task.CompletedTask;
        }

        var codes = ErrorCodeCatalog.ClientVisibleCodes(typeof(ErrorCodes));

        var codeEnum = codes.Select(entry => (IOpenApiAny)new OpenApiString(entry.Code)).ToList();
        var placeholderMap = new OpenApiObject();
        foreach (var (code, placeholders) in codes)
        {
            var placeholderArray = new OpenApiArray();
            foreach (var name in placeholders)
            {
                placeholderArray.Add(new OpenApiString(name));
            }

            placeholderMap[code] = placeholderArray;
        }

        // The handler writes code and placeholders into the response body as extensions; these
        // properties document that, and the enum pins the full set of client-visible codes for
        // generated clients and the contract test.
        schema.Properties["code"] = new OpenApiSchema { Type = "string", Enum = codeEnum };
        schema.Properties["placeholders"] = new OpenApiSchema
        {
            Type = "object",
            AdditionalProperties = new OpenApiSchema { Type = "string" },
        };
        schema.Extensions["x-error-placeholders"] = placeholderMap;

        return Task.CompletedTask;
    }
}
