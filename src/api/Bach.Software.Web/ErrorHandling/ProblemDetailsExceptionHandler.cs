using Bach.Software.Application.Errors;
using Bach.Software.Infrastructure.PlausibleAnalytics;
using FluentValidation;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Bach.Software.Web.ErrorHandling;

/// <summary>
/// The host's single exception handler: classifies every exception that reaches the top into an
/// RFC 9457 problem-details response and logs it once, with severity matched to its class
/// (4xx warning, 5xx error). Responses of 500 and above stay detail-free.
/// </summary>
public sealed partial class ProblemDetailsExceptionHandler(
    IProblemDetailsService problemDetailsService,
    ICorsPolicyProvider corsPolicyProvider,
    ICorsService corsService,
    ILogger<ProblemDetailsExceptionHandler> logger) : IExceptionHandler
{
    [LoggerMessage(Level = LogLevel.Warning, Message = "Request rejected with status {StatusCode}")]
    private static partial void LogRejected(ILogger logger, Exception exception, int statusCode);

    [LoggerMessage(Level = LogLevel.Error, Message = "Request failed with status {StatusCode}")]
    private static partial void LogFailed(ILogger logger, Exception exception, int statusCode);

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        var (statusCode, title) = Classify(exception);
        Log(statusCode, exception);

        httpContext.Response.StatusCode = statusCode;
        await ApplyCorsAsync(httpContext);

        var problemDetails = CreateProblemDetails(statusCode, exception);
        problemDetails.Status = statusCode;
        problemDetails.Title = title;

        return await problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = problemDetails,
        });
    }

    private static (int StatusCode, string Title) Classify(Exception exception) => exception switch
    {
        ValidationException => (StatusCodes.Status400BadRequest, "Validation failed"),
        AppException app => Classify(app.Error.Kind),
        // A malformed client request keeps the status the framework chose for it.
        BadHttpRequestException badRequest => (badRequest.StatusCode, "Invalid request"),
        // A failing external system is 502: the request was fine and the client may retry. A
        // genuine client abort never reaches this handler (the framework intercepts it), so a
        // TaskCanceledException here is a dependency timeout.
        HttpRequestException or PlausibleResponseException or TaskCanceledException =>
            (StatusCodes.Status502BadGateway, "A dependency failed"),
        _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred"),
    };

    private static (int StatusCode, string Title) Classify(FailureKind kind) => kind switch
    {
        FailureKind.Invalid => (StatusCodes.Status400BadRequest, "Invalid request"),
        FailureKind.NotFound => (StatusCodes.Status404NotFound, "Not found"),
        FailureKind.Conflict => (StatusCodes.Status409Conflict, "Conflict"),
        FailureKind.Unprocessable => (StatusCodes.Status422UnprocessableEntity, "Unprocessable request"),
        _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred"),
    };

    private static ProblemDetails CreateProblemDetails(int statusCode, Exception exception)
    {
        // From 500 up the body stays detail-free: those are bugs or outages, not a client contract.
        // The full exception is in the log.
        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            return new ProblemDetails();
        }

        if (exception is ValidationException validation)
        {
            // Codes, never FluentValidation's English messages: the frontend translates them.
            return new ValidationProblemDetails(validation.Errors
                .GroupBy(error => error.PropertyName ?? string.Empty)
                .ToDictionary(group => group.Key, group => group.Select(error => error.ErrorCode).ToArray()));
        }

        if (exception is not AppException app)
        {
            return new ProblemDetails();
        }

        var problemDetails = app.Errors.Any(error => error.Field is not null)
            ? new ValidationProblemDetails(app.Errors
                .GroupBy(error => error.Field ?? string.Empty)
                .ToDictionary(group => group.Key, group => group.Select(error => error.Error.Code).ToArray()))
            : new ProblemDetails();

        problemDetails.Extensions["code"] = app.Error.Code;
        problemDetails.Extensions["placeholders"] = app.Error.Placeholders;
        if (app.Errors.Count > 0)
        {
            // "errors" is taken by ValidationProblemDetails, so the per-item list with
            // placeholders travels as "errorDetails".
            problemDetails.Extensions["errorDetails"] = app.Errors
                .Select(error => new { code = error.Error.Code, field = error.Field, placeholders = error.Error.Placeholders })
                .ToList();
        }

        return problemDetails;
    }

    // The exception-handling middleware clears the response before calling the handler, which
    // drops the CORS headers. Without them a browser hides the status from the frontend.
    private async Task ApplyCorsAsync(HttpContext httpContext)
    {
        var policy = await corsPolicyProvider.GetPolicyAsync(httpContext, policyName: null);
        if (policy is null)
        {
            return;
        }

        corsService.ApplyResult(corsService.EvaluatePolicy(httpContext, policy), httpContext.Response);
    }

    private void Log(int statusCode, Exception exception)
    {
        if (statusCode >= StatusCodes.Status500InternalServerError)
        {
            LogFailed(logger, exception, statusCode);
        }
        else
        {
            LogRejected(logger, exception, statusCode);
        }
    }
}
