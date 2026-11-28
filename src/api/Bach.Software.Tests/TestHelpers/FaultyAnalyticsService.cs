using Bach.Software.Application.Interfaces;
using Bach.Software.Application.Models;

namespace Bach.Software.Tests.TestHelpers;

/// <summary>An analytics service that always fails with the supplied exception.</summary>
public sealed class FaultyAnalyticsService(Exception exception) : IAnalyticsService
{
    public Task<PageReads> GetPageReads(string url, CancellationToken cancellationToken) => throw exception;

    public Task<PageLikes> GetPageLikes(string url, CancellationToken cancellationToken) => throw exception;
}
