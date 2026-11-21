using System.Text.Json;
using Bach.Software.Application.Errors;
using Bach.Software.Tests.TestHelpers;

namespace Bach.Software.Tests;

/// <summary>
/// Keeps the frontend's copy of the error-code contract in sync with <see cref="ErrorCodes"/>.
/// Running the test regenerates <c>src/app/errors/error-codes.json</c> and then fails if the
/// committed file was stale, so CI blocks any backend code the frontend has never seen.
/// </summary>
public class ErrorCodesSyncTests
{
    private static readonly JsonSerializerOptions _indented = new() { WriteIndented = true };
    private static readonly string _contractFile = Path.Combine(FindRepositoryRoot(), "src", "app", "errors", "error-codes.json");

    [Fact]
    public void Frontend_contract_file_matches_the_backend_codes()
    {
        var expected = Serialize(typeof(ErrorCodes));
        var committed = File.Exists(_contractFile) ? File.ReadAllText(_contractFile) : null;

        // Regenerate first, so the fix for a failure is always just "commit the updated file".
        Directory.CreateDirectory(Path.GetDirectoryName(_contractFile)!);
        File.WriteAllText(_contractFile, expected);

        Assert.Equal(expected, committed);
    }

    [Fact]
    public void Frontend_contract_file_lists_the_url_validation_codes()
    {
        var map = ErrorCodeCatalog.AllCodes(typeof(ErrorCodes)).ToDictionary(entry => entry.Code, entry => entry.Placeholders);

        Assert.Empty(map["urlRequired"]);
        Assert.Empty(map["urlInvalid"]);
    }

    [Fact]
    public void Error_codes_are_unique_across_groups()
    {
        Assert.Empty(ErrorCodeCatalog.DuplicateCodes(typeof(ErrorCodes)));
    }

    [Fact]
    public void Error_codes_with_colliding_wire_code_are_reported()
    {
        var duplicates = ErrorCodeCatalog.DuplicateCodes(typeof(CollidingCatalog));

        Assert.Equal(["abC"], duplicates);
    }

    private static string Serialize(Type catalog) =>
        JsonSerializer.Serialize(
            ErrorCodeCatalog.AllCodes(catalog).ToDictionary(entry => entry.Code, entry => entry.Placeholders),
            _indented) + "\n";

    private static string FindRepositoryRoot()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null && !File.Exists(Path.Combine(directory.FullName, "pnpm-workspace.yaml")))
        {
            directory = directory.Parent;
        }

        return directory?.FullName ?? throw new InvalidOperationException("Repository root (pnpm-workspace.yaml) not found.");
    }

    // Two different group/method pairs that derive the same wire code ("abC").
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
