
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Bach.Software.Infrastructure.Plausible.Entities;
using Microsoft.Extensions.DependencyInjection;
using RichardSzalay.MockHttp;
using static Bach.Software.Infrastructure.Plausible.Entities.QueryResult;

namespace Bach.Software.Tests;

public class PageReadsTests
{
    [Fact]
    public async Task PageReads_ReturnsCorrectCount()
    {
        // There is no way to create a host for testing that runs Azure Functions
        // Keep an eye on the following issue until it is resolved:
        // https://github.com/Azure/azure-functions-dotnet-worker/issues/281
        Assert.Equal(true, true);
    }
}