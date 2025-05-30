using Bach.Software.Application.Models;
using FluentValidation;

namespace Bach.Software.Application.Validation;

public class UrlInputValidator : AbstractValidator<UrlInput>
{
    public UrlInputValidator()
    {
        RuleFor(x => x.Url)
            .NotEmpty().WithMessage("URL is required.")
            .Must(uri => Uri.TryCreate(uri, UriKind.Absolute, out var result) &&
                         (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps))
            .WithMessage("URL must be a valid http or https URL.");
    }
}
