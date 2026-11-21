namespace Bach.Software.Infrastructure.PlausibleAnalytics;

/// <summary>
/// Plausible answered, but the body cannot be used: it is not valid JSON, lacks required
/// members, or is a literal null. The dependency misbehaved, not our code.
/// </summary>
public sealed class PlausibleResponseException : Exception
{
    public PlausibleResponseException(string message)
        : base(message)
    {
    }

    public PlausibleResponseException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
