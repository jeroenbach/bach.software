using System.ComponentModel.DataAnnotations;
using System.Net;
using Bach.Software.API.Utils;
using Bach.Software.Application.Interfaces;
using Bach.Software.Application.Validation;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;
using Models = Bach.Software.Application.Models;

namespace Bach.Software.API;

public class Analytics
{
    private readonly ILogger<Analytics> _logger;
    private readonly IAnalyticsService _analyticsService;

    public Analytics(IAnalyticsService analyticsService, ILogger<Analytics> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    [Function("GetPageReads")]
    [OpenApiOperation(
        operationId: "pageReads",
        tags: new[] { "Analytics" },
        Summary = "Get read analytics for a page",
        Description = "Returns the read analytics for a given page.",
        Visibility = OpenApiVisibilityType.Important)]
    [OpenApiParameter("url", In = ParameterLocation.Query, Required = true, Type = typeof(string), Description = "The URL of the page to get read analytics for.")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(Models.PageReads), Description = "The OK response message containing a JSON result.")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.BadRequest, contentType: "application/json", bodyType: typeof(ValidationProblemDetails), Description = "Description of the error when the request is invalid.")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ProblemDetails), Description = "Description of the error when the request is invalid.")]
    public async Task<IActionResult> GetPageReads([HttpTrigger(AuthorizationLevel.Function, "get", Route = "analytics/pageReads")] HttpRequest req, string url)
        => await FunctionExceptionHandler.TryCatchAsync(_logger, async () => 
    {
        var validator = new UrlInputValidator();
        await validator.ValidateAndThrowAsync(new Models.UrlInput { Url = url });

        var read = await _analyticsService.GetPageReads(url!);
        return new OkObjectResult(read);
    });
}
