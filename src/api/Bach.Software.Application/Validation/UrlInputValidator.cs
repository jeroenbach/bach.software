using Bach.Software.Application.Errors;
using Bach.Software.Application.Models;
using FluentValidation;

namespace Bach.Software.Application.Validation;

public class UrlInputValidator : AbstractValidator<UrlInput>
{
    public UrlInputValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty().WithErrorCode(ErrorCodes.Url.Required().Code)
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var result) &&
                         (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps))
            .WithErrorCode(ErrorCodes.Url.Invalid().Code);
    }
}
