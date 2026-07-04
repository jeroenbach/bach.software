using Bach.Software.Application.Interfaces;
using Bach.Software.Infrastructure.PlausibleAnalytics.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Bach.Software.Web.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddBachSoftwareServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpClient();
        services.AddSingleton<IAnalyticsService, PlausibleService>();

        var allowedOrigins = configuration["CORS_ALLOWED_ORIGINS"]
            ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            ?? [];

        services.AddCors(options =>
            options.AddDefaultPolicy(policy =>
            {
                policy.AllowAnyHeader().AllowAnyMethod();

                if (allowedOrigins.Contains("localhost", StringComparer.OrdinalIgnoreCase))
                    policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost");
                else
                    policy.WithOrigins(allowedOrigins);
            }));

        return services;
    }
}
