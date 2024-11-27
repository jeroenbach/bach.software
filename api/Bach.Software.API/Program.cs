using Bach.Software.Core.Interfaces;
using Bach.Software.Infrastructure.PlausibleAnalytics.Services;
using Microsoft.Azure.Functions.Worker.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

var builder = FunctionsApplication.CreateBuilder(args);

builder.ConfigureFunctionsWebApplication();

builder.Services.AddHttpClient();
builder.Services.AddSingleton<IAnalyticsService, PlausibleService>();

// Enable CORS only in development mode
// if (builder.Environment.IsDevelopment())
// {
// builder.Services.AddCors(options =>
// {
//     options.AddDefaultPolicy(builder =>
//     {
//         builder.WithOrigins("http://localhost:3000/")
//                .AllowAnyMethod()
//                .AllowAnyHeader();
//     });
// });
// }

// Application Insights isn't enabled by default. See https://aka.ms/AAt8mw4.
// builder.Services
//     .AddApplicationInsightsTelemetryWorkerService()
//     .ConfigureFunctionsApplicationInsights();

var app = builder.Build();
app.Run();
