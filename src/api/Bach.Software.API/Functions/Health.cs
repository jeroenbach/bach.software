using System.Net;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;

namespace Bach.Software.API;

public class Health
{
    private readonly ILogger<Health> _logger;

    public Health(ILogger<Health> logger)
    {
        _logger = logger;
    }

    [Function("health")]
    [OpenApiOperation(
        operationId: "health",
        tags: new[] { "Monitoring" },
        Visibility = OpenApiVisibilityType.Important)]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.OK, contentType: "application/json", bodyType: typeof(string), Description = "The OK response message")]
    [OpenApiResponseWithBody(statusCode: HttpStatusCode.InternalServerError, contentType: "application/json", bodyType: typeof(ProblemDetails), Description = "Description of the error when the request is invalid.")]

    public IActionResult Run([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
    {
        _logger.LogInformation("health check");
        return new OkObjectResult("Healthy!");
    }
}
