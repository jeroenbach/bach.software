using System.ComponentModel;
using Bach.Software.Application.Interfaces;
using Bach.Software.Application.Validation;
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
            .WithDescription("Returns the read analytics for a given page.");

        app.MapGet("/api/analytics/pageLikes", GetPageLikes)
            .WithName("pageLikes")
            .WithTags("Analytics")
            .WithSummary("Get like analytics for a page")
            .WithDescription("Returns the number of likes for a given page.");
    }

    private static async Task<Results<Ok<Models.PageReads>, BadRequest<ValidationProblemDetails>, ProblemHttpResult>> GetPageReads(
        [Description("The URL of the page to get read analytics for.")] string url,
        IAnalyticsService analyticsService,
        CancellationToken cancellationToken)
    {
        await new UrlInputValidator().ValidateAndThrowAsync(new Models.UrlInput { Url = url }, cancellationToken);

        var read = await analyticsService.GetPageReads(url, cancellationToken);
        return TypedResults.Ok(read);
    }

    private static async Task<Results<Ok<Models.PageLikes>, BadRequest<ValidationProblemDetails>, ProblemHttpResult>> GetPageLikes(
        [Description("The URL of the page to get like analytics for.")] string url,
        IAnalyticsService analyticsService,
        CancellationToken cancellationToken)
    {
        await new UrlInputValidator().ValidateAndThrowAsync(new Models.UrlInput { Url = url }, cancellationToken);

        var likes = await analyticsService.GetPageLikes(url, cancellationToken);
        return TypedResults.Ok(likes);
    }
}
