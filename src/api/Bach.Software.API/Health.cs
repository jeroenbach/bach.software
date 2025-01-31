using Bach.Software.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Bach.Software.API;

public class Health
{
    private readonly ILogger<PageReads> _logger;

    public Health(ILogger<PageReads> logger)
    {
        _logger = logger;
    }

    [Function("health")]
    public IActionResult Run([HttpTrigger(AuthorizationLevel.Function, "get")] HttpRequest req)
    {
        _logger.LogInformation("health check");
        return new OkObjectResult("Healthy!");
    }
}
