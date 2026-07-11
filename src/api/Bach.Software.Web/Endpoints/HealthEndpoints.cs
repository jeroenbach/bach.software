using Microsoft.AspNetCore.Http.HttpResults;

namespace Bach.Software.Web.Endpoints;

public static class HealthEndpoints
{
    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/health", GetHealth)
            .WithName("health")
            .WithTags("Monitoring")
            .WithSummary("Health check")
            .WithDescription("Returns the health status of the API")
            .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static Ok<string> GetHealth(ILogger<Program> logger)
    {
        logger.LogInformation("health check");
        return TypedResults.Ok("Healthy!");
    }
}
