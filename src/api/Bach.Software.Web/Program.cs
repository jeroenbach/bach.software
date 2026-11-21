using Bach.Software.Web.ErrorHandling;
using Bach.Software.Web.Extensions;
using Microsoft.AspNetCore.Diagnostics;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddBachSoftwareServices(builder.Configuration);
builder.Services.AddBachSoftwareOpenApi();

// Exactly one handler; AddProblemDetails supplies the RFC 9457 body writer.
builder.Services.AddExceptionHandler<ProblemDetailsExceptionHandler>();
builder.Services.AddProblemDetails();

// The handler logs every failure itself, so drop the middleware's own error-level log. The
// SuppressDiagnosticsCallback option only exists from .NET 10 on, hence the category filter.
builder.Logging.AddFilter(
    typeof(ExceptionHandlerMiddleware).FullName!,
    level => level < LogLevel.Error);

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    // Serves the OpenAPI document at /openapi/v1.json (used by Kiota, see src/app/services/backend/README.md)
    app.MapOpenApi();
}

app.UseExceptionHandler();
app.UseCors();
app.UseHttpsRedirection();

// Failure classes every endpoint can produce are declared once, on the root group:
// 500 (an unclassified exception, a bug) and 502 (an external dependency failed).
var api = app.MapGroup("/")
    .ProducesProblem(StatusCodes.Status500InternalServerError)
    .ProducesProblem(StatusCodes.Status502BadGateway);

api.MapBachSoftwareEndpoints();

app.Run();

// Make the implicit Program class public so test projects can reference it
public partial class Program { }
