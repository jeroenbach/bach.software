using Bach.Software.Application.Errors;
using Bach.Software.Application.Models;
using Bach.Software.Application.Validation;

namespace Bach.Software.Tests;

public class UrlInputValidatorErrorCodeTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("/relative/path")]
    [InlineData("ftp://bach.software/x")]
    public void Validate_WithInvalidInputs_EveryFailureCarriesACatalogCode(string url)
    {
        var catalogCodes = ErrorCodeCatalog.AllCodes(typeof(ErrorCodes)).Select(entry => entry.Code).ToHashSet();

        var result = new UrlInputValidator().Validate(new UrlInput { Url = url });

        Assert.False(result.IsValid);
        Assert.All(result.Errors, error => Assert.Contains(error.ErrorCode, catalogCodes));
    }
}
