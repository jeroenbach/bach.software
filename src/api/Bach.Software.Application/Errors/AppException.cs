namespace Bach.Software.Application.Errors;

/// <summary>
/// The exception for failures this service detects in its own rules. It carries an
/// <see cref="ErrorCode"/> (created via <see cref="ErrorCodes"/>), an optional log-only message,
/// and, for batch operations, one <see cref="AppError"/> per failed item.
/// </summary>
/// <remarks>
/// Throw it where our own code decides the operation cannot proceed. It never wraps exceptions
/// from other libraries: those propagate as their own types and get their own arm in the
/// exception handler.
/// </remarks>
public sealed class AppException : Exception
{
    private readonly List<AppError> _errors = [];
    private string? _logMessage;

    private AppException(ErrorCode error) => Error = error;

    /// <summary>Starts a new <see cref="AppException"/> for the given <see cref="ErrorCodes"/> entry.</summary>
    public static AppException Create(ErrorCode error) => new(error);

    /// <summary>The failure's code, kind, and placeholders.</summary>
    public ErrorCode Error { get; }

    /// <summary>Per-item failures of a batch operation; empty when the failure is a single one.</summary>
    public IReadOnlyList<AppError> Errors => _errors;

    /// <summary>Adds technical detail for the log. Clients never see it.</summary>
    public AppException WithMessage(string logMessage)
    {
        _logMessage = logMessage;
        return this;
    }

    /// <summary>
    /// Records one failed item. Pass <paramref name="field"/> when the failure belongs to a request
    /// field; the exception handler then responds with a validation problem keyed on it.
    /// </summary>
    public AppException WithError(ErrorCode error, string? field = null)
    {
        _errors.Add(new AppError(error, field));
        return this;
    }

    /// <summary>For the log only; the client-facing contract is the code and its placeholders.</summary>
    public override string Message
    {
        get
        {
            var parts = new List<string> { Error.Code };
            if (_logMessage is not null)
            {
                parts.Add(_logMessage);
            }

            if (Error.Placeholders.Count > 0)
            {
                parts.Add($"({string.Join(", ", Error.Placeholders.Select(p => $"{p.Key}: {p.Value}"))})");
            }

            if (_errors.Count > 0)
            {
                parts.Add($"[{_errors.Count} error(s): {string.Join("; ", _errors.Select(e => e.Error.Code))}]");
            }

            return string.Join(" ", parts);
        }
    }
}

/// <summary>A single failed item inside a batch failure, optionally tied to a request field.</summary>
public sealed record AppError(ErrorCode Error, string? Field = null);
