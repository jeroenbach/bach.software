using System;

namespace Bach.Software.Core.Interfaces;

public interface IAnalyticsService
{
    /// <summary>
    /// Interface for analytics service to get page reads.
    /// </summary>
    /// <param name="url">The url of the page we want to check</param>
    /// <returns>A task that represents the asynchronous operation. The task result contains the number of page reads.</returns>
    Task<int> GetPageReads(string url);
}