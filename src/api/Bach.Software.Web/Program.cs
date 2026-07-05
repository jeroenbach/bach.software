using Bach.Software.Web.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddBachSoftwareServices(builder.Configuration);
builder.Services.AddBachSoftwareOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    // Serves the OpenAPI document at /openapi/v1.json (used by Kiota, see src/app/services/backend/README.md)
    app.MapOpenApi();
}

app.UseCors();
app.UseHttpsRedirection();

// Map all endpoints
app.MapBachSoftwareEndpoints();

app.Run();

// Make the implicit Program class public so test projects can reference it
public partial class Program { }
