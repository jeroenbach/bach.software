using Bach.Software.Web.Endpoints;
using Microsoft.AspNetCore.Builder;

namespace Bach.Software.Web.Extensions;

public static class WebApplicationExtensions
{
    public static WebApplication MapBachSoftwareEndpoints(this WebApplication app)
    {
        app.MapHealthEndpoints();
        app.MapAnalyticsEndpoints();

        return app;
    }
}
