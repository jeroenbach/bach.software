namespace Bach.Software.Application.Errors;

/// <summary>
/// What kind of failure an <see cref="ErrorCode"/> represents, free of HTTP concepts.
/// The Web layer's exception handler maps each kind to a status code in exactly one place.
/// </summary>
public enum FailureKind
{
    /// <summary>The request itself is wrong (400).</summary>
    Invalid,

    /// <summary>The addressed resource does not exist (404).</summary>
    NotFound,

    /// <summary>The request contradicts the current state of the system (409).</summary>
    Conflict,

    /// <summary>The request is well-formed but its content cannot be processed (422).</summary>
    Unprocessable,
}

/// <summary>
/// One failure the API can report: a machine-readable code, the <see cref="FailureKind"/>
/// it belongs to, and the placeholder values the frontend interpolates into its translation.
/// Production code creates instances only through the factories on <see cref="ErrorCodes"/>.
/// </summary>
public sealed record ErrorCode
{
    public ErrorCode(string group, string name, FailureKind kind = FailureKind.Invalid, object? placeholders = null)
    {
        // "Url" + "Required" => "urlRequired". Deriving the wire code from the two names keeps it
        // in step with the catalog that the sync test reflects over.
        Code = char.ToLowerInvariant(group[0]) + group[1..] + name;
        Kind = kind;
        Placeholders = placeholders?.GetType().GetProperties()
            .ToDictionary(property => property.Name, property => property.GetValue(placeholders))
            ?? new Dictionary<string, object?>();
    }

    /// <summary>The code the frontend translates, for example <c>urlRequired</c>.</summary>
    public string Code { get; }

    /// <summary>What kind of failure this is; the exception handler maps it to a status code.</summary>
    public FailureKind Kind { get; }

    /// <summary>Values the frontend interpolates into the translated message.</summary>
    public IReadOnlyDictionary<string, object?> Placeholders { get; }
}
