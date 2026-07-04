using Bach.Software.Web.Extensions;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddBachSoftwareServices(builder.Configuration);

// Add OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors();
app.UseHttpsRedirection();

// Map all endpoints
app.MapBachSoftwareEndpoints();

app.Run();

// Make the implicit Program class public so test projects can reference it
public partial class Program { }
