using System.Reflection;
using Bach.Software.Application.Errors;

namespace Bach.Software.Tests.TestHelpers;

/// <summary>Reads an error-code catalog by reflection: the wire code and the placeholder names of every factory.</summary>
public static class ErrorCodeCatalog
{
    public static IReadOnlyList<(string Code, string[] Placeholders)> AllCodes(Type catalog) => [.. catalog
        .GetNestedTypes(BindingFlags.Public)
        .SelectMany(group => group
            .GetMethods(BindingFlags.Public | BindingFlags.Static | BindingFlags.DeclaredOnly)
            .Where(method => method.ReturnType == typeof(ErrorCode))
            .Select(method => (
                Code: char.ToLowerInvariant(group.Name[0]) + group.Name[1..] + method.Name,
                Placeholders: method.GetParameters().Select(parameter => parameter.Name!).ToArray())))
        .OrderBy(entry => entry.Code, StringComparer.Ordinal)];

    public static IReadOnlyList<string> DuplicateCodes(Type catalog) => [.. AllCodes(catalog)
        .GroupBy(entry => entry.Code)
        .Where(group => group.Count() > 1)
        .Select(group => group.Key)];
}
