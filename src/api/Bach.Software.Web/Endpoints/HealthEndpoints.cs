using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Attributes;
using Microsoft.Azure.WebJobs.Extensions.OpenApi.Core.Enums;
using Microsoft.Extensions.Logging;
using Microsoft.OpenApi.Models;

namespace Bach.Software.Web.Endpoints;

public static class HealthEndpoints
{
    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/health", GetHealth)
            .WithName("health")
            .WithOpenApi(operation =>
            {
                operation.OperationId = "health";
                operation.Tags = new List<OpenApiTag> { new() { Name = "Monitoring" } };
                operation.Summary = "Health check";
                operation.Description = "Returns the health status of the API";
                return operation;
            });
    }

    private static IResult GetHealth(ILogger<Program> logger)
    {
        logger.LogInformation("health check");
        return Results.Ok("Healthy!");
    }
}
