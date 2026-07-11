using Microsoft.OpenApi.Models;

namespace Bach.Software.Web.Extensions;

public static class OpenApiExtensions
{
    private const string RoutePrefix = "/api";

    public static IServiceCollection AddBachSoftwareOpenApi(this IServiceCollection services)
    {
        services.AddOpenApi(options =>
            options.AddDocumentTransformer((document, _, _) =>
            {
                // All endpoints are hosted under /api. Expose that prefix as the server URL and
                // strip it from the paths, so clients generated from this document (Kiota) keep
                // building requests as {baseUrl: '/api'} + '/analytics/...' — the same contract
                // the frontend request adapter already uses (see src/app/services/backend).
                document.Servers = [new OpenApiServer { Url = RoutePrefix }];

                var paths = new OpenApiPaths();
                foreach (var (path, item) in document.Paths)
                {
                    var trimmed = path.StartsWith(RoutePrefix, StringComparison.OrdinalIgnoreCase)
                        ? path[RoutePrefix.Length..]
                        : path;
                    paths[trimmed] = item;
                }

                document.Paths = paths;

                return Task.CompletedTask;
            }));

        return services;
    }
}
