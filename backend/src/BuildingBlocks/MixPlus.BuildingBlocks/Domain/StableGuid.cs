using System.Security.Cryptography;
using System.Text;

namespace MixPlus.BuildingBlocks.Domain;

/// <summary>
/// Deterministic Guid from a stable string key (frontend mock ids → DB primary keys).
/// </summary>
public static class StableGuid
{
    public static Guid From(string key)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(key);
        var hash = MD5.HashData(Encoding.UTF8.GetBytes("mixplus:" + key.Trim()));
        return new Guid(hash);
    }
}
