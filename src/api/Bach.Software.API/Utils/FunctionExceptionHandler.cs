using System.Net;
using Bach.Software.API.Extensions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Bach.Software.API.Utils;

/// <summary>
/// Unfortunately, the Azure Functions SDK does not provide a built-in way to handle exceptions globally.
/// This class provides a way to handle exceptions in Azure Functions using a try-catch pattern.
/// It can be used to catch specific exceptions like ValidationException and return appropriate HTTP responses.
/// It can also catch general exceptions and return a 500 Internal Server Error response.
/// </summary>
public static class FunctionExceptionHandler
{
    public static async Task<IActionResult> TryCatchAsync<T>(ILogger<T> logger, Func<Task<IActionResult>> action)
    {
        try
        {
            return await action();
        }
        catch (ValidationException ex)
        {
            var validationProblemDetails = ex.ToValidationProblemDetails();
            return new BadRequestObjectResult(validationProblemDetails);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while processing the request.");

            // Log the exception details, but do not expose sensitive information in the response.
            // If you need to show more details in the response, create a custom exception and catch it here.
            return new ObjectResult(new ProblemDetails
            {
                Title = "Internal Server Error occurred",
                Detail = "An unexpected error occurred while processing your request.",
                Status = (int)HttpStatusCode.InternalServerError
            })
            {
                StatusCode = (int)HttpStatusCode.InternalServerError,
                ContentTypes = { "application/problem+json" }
            };
        }
    }
}
