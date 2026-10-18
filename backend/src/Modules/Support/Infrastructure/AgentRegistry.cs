using System.Collections.Concurrent;

namespace MixPlus.Modules.Support.Infrastructure;

public interface IAgentRegistry
{
    ChatAgentDto Register(string displayName, string? agentId = null);
    ChatAgentDto? Heartbeat(string agentId);
    void SetOffline(string agentId);
    IReadOnlyList<ChatAgentDto> List(bool onlineOnly = false);
    ChatAgentDto? Get(string agentId);
    ChatAgentDto? PickOnlineAgent();
}

public sealed class AgentRegistry : IAgentRegistry
{
    private readonly ConcurrentDictionary<string, ChatAgentDto> _agents = new(StringComparer.OrdinalIgnoreCase);
    private static readonly TimeSpan OnlineTtl = TimeSpan.FromMinutes(2);

    public ChatAgentDto Register(string displayName, string? agentId = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(displayName);
        var id = string.IsNullOrWhiteSpace(agentId) ? Guid.NewGuid().ToString("N") : agentId.Trim();
        var agent = new ChatAgentDto
        {
            Id = id,
            DisplayName = displayName.Trim(),
            IsOnline = true,
            LastSeenAtUtc = DateTimeOffset.UtcNow,
        };
        _agents[id] = agent;
        return agent;
    }

    public ChatAgentDto? Heartbeat(string agentId)
    {
        if (!_agents.TryGetValue(agentId, out var agent))
        {
            return null;
        }

        agent.IsOnline = true;
        agent.LastSeenAtUtc = DateTimeOffset.UtcNow;
        return agent;
    }

    public void SetOffline(string agentId)
    {
        if (_agents.TryGetValue(agentId, out var agent))
        {
            agent.IsOnline = false;
            agent.LastSeenAtUtc = DateTimeOffset.UtcNow;
        }
    }

    public IReadOnlyList<ChatAgentDto> List(bool onlineOnly = false)
    {
        Prune();
        var all = _agents.Values.OrderByDescending(a => a.IsOnline).ThenBy(a => a.DisplayName).ToList();
        return onlineOnly ? all.Where(a => a.IsOnline).ToList() : all;
    }

    public ChatAgentDto? Get(string agentId)
    {
        Prune();
        return _agents.TryGetValue(agentId, out var agent) ? agent : null;
    }

    public ChatAgentDto? PickOnlineAgent()
    {
        Prune();
        return _agents.Values
            .Where(a => a.IsOnline)
            .OrderBy(a => a.LastSeenAtUtc)
            .FirstOrDefault();
    }

    private void Prune()
    {
        var cutoff = DateTimeOffset.UtcNow - OnlineTtl;
        foreach (var agent in _agents.Values)
        {
            if (agent.IsOnline && agent.LastSeenAtUtc < cutoff)
            {
                agent.IsOnline = false;
            }
        }
    }
}
