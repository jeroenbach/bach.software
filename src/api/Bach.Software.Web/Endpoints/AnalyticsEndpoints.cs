using System.ComponentModel;
using Bach.Software.Application.Interfaces;
using Bach.Software.Application.Validation;
using Bach.Software.Web.Extensions;
using FluentValidation;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Models = Bach.Software.Application.Models;

namespace Bach.Software.Web.Endpoints;

public static class AnalyticsEndpoints
{
    public static void MapAnalyticsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/analytics/pageReads", GetPageReads)
            .WithName("pageReads")
            .WithTags("Analytics")
            .WithSummary("Get read analytics for a page")
            .WithDescription("Returns the read analytics for a given page.")
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        app.MapGet("/api/analytics/pageLikes", GetPageLikes)
            .WithName("pageLikes")
            .WithTags("Analytics")
            .WithSummary("Get like analytics for a page")
            .WithDescription("Returns the number of likes for a given page.")
            .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<Results<Ok<Models.PageReads>, BadRequest<ValidationProblemDetails>, ProblemHttpResult>> GetPageReads(
        [Description("The URL of the page to get read analytics for.")] string url,
        IAnalyticsService analyticsService,
        ILogger<Program> logger)
    {
        try
        {
            var validator = new UrlInputValidator();
            await validator.ValidateAndThrowAsync(new Models.UrlInput { Url = url });

            var read = await analyticsService.GetPageReads(url);
            return TypedResults.Ok(read);
        }
        catch (ValidationException ex)
        {
            return TypedResults.BadRequest(ex.ToValidationProblemDetails());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while processing the request.");

            return TypedResults.Problem(
                title: "Internal Server Error occurred",
                detail: "An unexpected error occurred while processing your request.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    private static async Task<Results<Ok<Models.PageLikes>, BadRequest<ValidationProblemDetails>, ProblemHttpResult>> GetPageLikes(
        [Description("The URL of the page to get like analytics for.")] string url,
        IAnalyticsService analyticsService,
        ILogger<Program> logger)
    {
        try
        {
            var validator = new UrlInputValidator();
            await validator.ValidateAndThrowAsync(new Models.UrlInput { Url = url });

            var likes = await analyticsService.GetPageLikes(url);
            return TypedResults.Ok(likes);
        }
        catch (ValidationException ex)
        {
            return TypedResults.BadRequest(ex.ToValidationProblemDetails());
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while processing the request.");

            return TypedResults.Problem(
                title: "Internal Server Error occurred",
                detail: "An unexpected error occurred while processing your request.",
                statusCode: StatusCodes.Status500InternalServerError);
        }
    }
}
