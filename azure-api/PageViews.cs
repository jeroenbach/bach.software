using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Bach.Software.Function
{
    public class PageViews
    {
        private readonly ILogger<PageViews> _logger;
        private readonly string _apiToken;

        public PageViews(ILogger<PageViews> logger, IConfiguration configuration)
        {
            _logger = logger;
            _apiToken = configuration["PLAUSIBLE_API_TOKEN"];
        }

        [Function("PageViews")]
        public IActionResult Run([HttpTrigger(AuthorizationLevel.Function, "get", "post")] HttpRequest req)
        {
            _logger.LogInformation("C# HTTP trigger function processed a request.");
            return new OkObjectResult($"Welcome to Azure Functions! test Token {_apiToken}");
        }
    }
}
