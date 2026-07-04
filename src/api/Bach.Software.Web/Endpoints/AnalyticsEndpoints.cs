using System.Net;
using Bach.Software.Web.Extensions;
using Bach.Software.Application.Interfaces;
using Bach.Software.Application.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Models = Bach.Software.Application.Models;

namespace Bach.Software.Web.Endpoints;

public static class AnalyticsEndpoints
{
    public static void MapAnalyticsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/analytics/pageReads", GetPageReads)
            .WithName("GetPageReads")
            .WithOpenApi(operation =>
            {
                operation.OperationId = "pageReads";
                operation.Tags = new List<OpenApiTag> { new() { Name = "Analytics" } };
                operation.Summary = "Get read analytics for a page";
                operation.Description = "Returns the read analytics for a given page.";

                operation.Parameters[0].Description = "The URL of the page to get read analytics for.";
                operation.Parameters[0].Required = true;

                return operation;
            });
    }

    private static async Task<IResult> GetPageReads(string url, IAnalyticsService analyticsService, ILogger<Program> logger)
    {
        try
        {
            var validator = new UrlInputValidator();
            await validator.ValidateAndThrowAsync(new Models.UrlInput { Url = url });

            var read = await analyticsService.GetPageReads(url!);
            return Results.Ok(read);
        }
        catch (ValidationException ex)
        {
            var validationProblemDetails = ex.ToValidationProblemDetails();
            return Results.BadRequest(validationProblemDetails);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unexpected error occurred while processing the request.");

            return Results.Problem(
                title: "Internal Server Error occurred",
                detail: "An unexpected error occurred while processing your request.",
                statusCode: (int)HttpStatusCode.InternalServerError);
        }
    }
}
