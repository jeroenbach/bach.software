using Bach.Software.Web.ErrorHandling;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.DependencyInjection;

namespace Bach.Software.Tests.Integration;

public class ExceptionHandlerRegistrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly CustomWebApplicationFactory _factory;

    public ExceptionHandlerRegistrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public void Services_Always_RegisterExactlyOneProblemDetailsExceptionHandler()
    {
        var handler = Assert.Single(_factory.Services.GetServices<IExceptionHandler>());

        Assert.IsType<ProblemDetailsExceptionHandler>(handler);
    }
}
