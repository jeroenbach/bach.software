using Bach.Software.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Bach.Software.API;

public class PageReads
{
    private readonly ILogger<PageReads> _logger;
    private readonly IAnalyticsService _analyticsService;

    public PageReads(IAnalyticsService analyticsService, ILogger<PageReads> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    [Function("pageReads")]
    public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req, string url)
    {
        if (string.IsNullOrEmpty(url))
        {
            _logger.LogWarning("No url specified in the request");
            return new BadRequestObjectResult("Invalid request");
        }

        var read = await _analyticsService.GetPageReads(url!);
        return new OkObjectResult(read);
    }
}
