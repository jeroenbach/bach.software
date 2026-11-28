using System.Reflection;

namespace Bach.Software.Application.Errors;

/// <summary>
/// Reads an error-code catalog (a type with nested classes per concern, each holding static
/// <see cref="ErrorCode"/> factories) by reflection: the wire code, the placeholder names, and
/// the kind of every factory. The same derivation the <see cref="ErrorCode"/> constructor uses,
/// so a catalog reader can never drift from the codes it reads. Shared by the OpenAPI document
/// transformer that publishes the catalog and the tests that pin it.
/// </summary>
public static class ErrorCodeCatalog
{
    public static IReadOnlyList<(string Code, string[] Placeholders, FailureKind Kind)> AllCodes(Type catalog) => [.. catalog
        .GetNestedTypes(BindingFlags.Public)
        .SelectMany(group => group
            .GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.DeclaredOnly)
            .Where(method => method.ReturnType == typeof(ErrorCode))
            .Select(method => (
                Code: char.ToLowerInvariant(group.Name[0]) + group.Name[1..] + method.Name,
                Placeholders: method.GetParameters().Select(parameter => parameter.Name!).ToArray(),
                Kind: Materialize(method).Kind)))
        .OrderBy(entry => entry.Code, StringComparer.Ordinal)];

    /// <summary>
    /// The codes the frontend can actually receive. Dependency failures map to a detail-free
    /// 502, so their codes never leave the service and need no translation.
    /// </summary>
    public static IReadOnlyList<(string Code, string[] Placeholders)> ClientVisibleCodes(Type catalog) => [.. AllCodes(catalog)
        .Where(entry => entry.Kind != FailureKind.Dependency)
        .Select(entry => (entry.Code, entry.Placeholders))];

    public static IReadOnlyList<string> DuplicateCodes(Type catalog) => [.. AllCodes(catalog)
        .GroupBy(entry => entry.Code)
        .Where(group => group.Count() > 1)
        .Select(group => group.Key)];

    // The kind only exists on an instance, so each factory is invoked with placeholder dummies.
    private static ErrorCode Materialize(MethodInfo factory) => (ErrorCode)factory.Invoke(null, [.. factory.GetParameters()
        .Select(parameter => parameter.ParameterType.IsValueType ? Activator.CreateInstance(parameter.ParameterType) : null)])!;
}
