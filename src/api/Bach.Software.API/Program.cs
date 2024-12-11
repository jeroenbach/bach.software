using Bach.Software.Core.Interfaces;
using Bach.Software.Infrastructure.PlausibleAnalytics.Services;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IAnalyticsService, PlausibleService>();

builder.Services
    .AddApplicationInsightsTelemetryWorkerService()
    .ConfigureFunctionsApplicationInsights();

var app = builder.Build();
app.Run();
