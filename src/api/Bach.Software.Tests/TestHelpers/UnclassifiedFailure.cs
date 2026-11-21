namespace Bach.Software.Tests.TestHelpers;

public static class UnclassifiedFailure
{
    // A NullReferenceException is the canonical unclassified bug; CA2201 forbids creating one in production code.
#pragma warning disable CA2201
    public static NullReferenceException Create(string? message = null) => new(message);
#pragma warning restore CA2201
}
