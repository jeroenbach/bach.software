using Microsoft.AspNetCore.Http.HttpResults;

namespace Bach.Software.Web.Endpoints;

public static partial class HealthEndpoints
{
    [LoggerMessage(Level = LogLevel.Information, Message = "health check")]
    private static partial void LogHealthCheck(ILogger logger);

    public static void MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/health", GetHealth)
            .WithName("health")
            .WithTags("Monitoring")
            .WithSummary("Health check")
            .WithDescription("Returns the health status of the API");
    }

    private static Ok<string> GetHealth(ILogger<Program> logger)
    {
        LogHealthCheck(logger);
        return TypedResults.Ok("Healthy!");
    }
}
