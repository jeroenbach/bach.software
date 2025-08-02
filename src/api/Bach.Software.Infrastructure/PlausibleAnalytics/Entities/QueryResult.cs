
using System.Text.Json.Serialization;

namespace Bach.Software.Infrastructure.Plausible.Entities;

public class QueryResult
{
    [JsonPropertyName("results")]
    public required List<Result> Results { get; set; }

    public class Result
    {
        [JsonPropertyName("metrics")]
        public required List<int> Metrics { get; set; }

        [JsonPropertyName("dimensions")]
        public required List<string> Dimensions { get; set; }
    }
}
