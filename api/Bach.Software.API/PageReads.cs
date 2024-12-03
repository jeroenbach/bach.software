using Bach.Software.Core.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace Bach.Software.API
{
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
        public async Task<IActionResult> Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
        {
            // Get the URL of the page that calls this service from the Referer header
            var refererUrl = req.Headers["Referer"].ToString();
            var url = req.GetDisplayUrl();
            var read = await _analyticsService.GetPageReads("https://gentle-glacier-00e050903-6.westeurope.5.azurestaticapps.net/posts/1");

            return new OkObjectResult(read);
        }
    }
}
