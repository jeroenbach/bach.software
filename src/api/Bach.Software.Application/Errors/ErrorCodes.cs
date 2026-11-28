namespace Bach.Software.Application.Errors;

/// <summary>
/// Every failure this API can report, grouped per concern in nested classes. Throw sites call
/// these factories instead of constructing an <see cref="ErrorCode"/> inline. The OpenAPI
/// document transformer publishes each client-visible code with its placeholder names, so the
/// committed document is the frontend's copy of this catalog.
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

    public static class Analytics
    {
        // Kind Dependency maps to a detail-free 502, so this code appears only in the log,
        // never in a response body or in the OpenAPI document's published contract.
        public static ErrorCode ResponseInvalid() =>
            new(nameof(Analytics), nameof(ResponseInvalid), FailureKind.Dependency);
    }
}
