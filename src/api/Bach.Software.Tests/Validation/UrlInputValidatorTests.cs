using Bach.Software.Application.Errors;
using Bach.Software.Application.Models;
using Bach.Software.Application.Validation;

namespace Bach.Software.Tests.Validation;

public class UrlInputValidatorTests
{
    private static readonly string[] _requiredAndInvalid =
    [
        ErrorCodes.Url.Required().Code,
        ErrorCodes.Url.Invalid().Code,
    ];

    private static readonly string[] _invalidOnly = [ErrorCodes.Url.Invalid().Code];

    [Fact]
    public void Validate_WithEmptyUrl_FailsWithUrlRequiredCode()
    {
        var result = Validate("");

        Assert.False(result.IsValid);
        Assert.Equal(_requiredAndInvalid, ErrorCodesOf(result));
    }

    [Fact]
    public void Validate_WithNullUrl_FailsWithUrlRequiredCode()
    {
        var result = Validate(null!);

        Assert.False(result.IsValid);
        Assert.Equal(_requiredAndInvalid, ErrorCodesOf(result));
    }

    [Fact]
    public void Validate_WithWhitespaceUrl_FailsWithUrlRequiredCode()
    {
        var result = Validate("   ");

        Assert.False(result.IsValid);
        Assert.Equal(_requiredAndInvalid, ErrorCodesOf(result));
    }

    [Theory]
    [InlineData("not-a-valid-url")]
    [InlineData("relative/path")]
    [InlineData("/relative/path")]
    public void Validate_WithRelativeUrl_FailsWithUrlInvalidCode(string url)
    {
        var result = Validate(url);

        Assert.False(result.IsValid);
        Assert.Equal(_invalidOnly, ErrorCodesOf(result));
    }

    [Theory]
    [InlineData("ftp://example.com")]
    [InlineData("file:///etc/hosts")]
    [InlineData("mailto:a@b.c")]
    [InlineData("javascript:alert(1)")]
    public void Validate_WithNonHttpScheme_FailsWithUrlInvalidCode(string url)
    {
        var result = Validate(url);

        Assert.False(result.IsValid);
        Assert.Equal(_invalidOnly, ErrorCodesOf(result));
    }

    [Theory]
    [InlineData("http://example.com")]
    [InlineData("https://bach.software/test?x=1#frag")]
    [InlineData("HTTPS://EXAMPLE.COM")]
    public void Validate_WithAbsoluteHttpOrHttpsUrl_Passes(string url)
    {
        var result = Validate(url);

        Assert.True(result.IsValid);
        Assert.Empty(result.Errors);
    }

    private static FluentValidation.Results.ValidationResult Validate(string url) =>
        new UrlInputValidator().Validate(new UrlInput { Url = url });

    private static string[] ErrorCodesOf(FluentValidation.Results.ValidationResult result) =>
        [.. result.Errors.Select(error => error.ErrorCode)];
}
