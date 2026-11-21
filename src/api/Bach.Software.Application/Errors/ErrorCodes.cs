namespace Bach.Software.Application.Errors;

/// <summary>
/// Every failure this API can report, grouped per concern in nested classes. Throw sites call
/// these factories instead of constructing an <see cref="ErrorCode"/> inline, and the backend
/// sync test exports each code with its placeholder names to the frontend.
/// </summary>
/// <remarks>
/// The wire code is derived from the group and method names (<c>Url.Required</c> becomes
/// <c>urlRequired</c>), so renaming either is a breaking contract change. Do not overload a
/// factory: one code, one parameter list.
/// </remarks>
public static class ErrorCodes
{
    public static class Url
    {
        public static ErrorCode Required() =>
            new(nameof(Url), nameof(Required), FailureKind.Invalid);

        public static ErrorCode Invalid() =>
            new(nameof(Url), nameof(Invalid), FailureKind.Invalid);
    }
}
