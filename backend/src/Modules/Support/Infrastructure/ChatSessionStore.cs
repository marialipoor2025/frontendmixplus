using System.Collections.Concurrent;

namespace MixPlus.Modules.Support.Infrastructure;

public interface IChatSessionStore
{
    ChatSessionDto Create(string visitorId, string? visitorName);
    ChatSessionDto? Get(string sessionId);
    IReadOnlyList<ChatSessionDto> ListOpen();
    ChatMessageDto? AddMessage(
        string sessionId,
        ChatSender sender,
        string senderName,
        string text,
        ChatAttachmentDto? attachment = null);
    bool AssignAgent(string sessionId, string agentId, string agentName);
    bool Close(string sessionId);
}

public sealed class ChatSessionStore : IChatSessionStore
{
    private readonly ConcurrentDictionary<string, ChatSessionDto> _sessions = new(StringComparer.OrdinalIgnoreCase);

    public ChatSessionDto Create(string visitorId, string? visitorName)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(visitorId);
        var now = DateTimeOffset.UtcNow;
        var session = new ChatSessionDto
        {
            Id = Guid.NewGuid().ToString("N"),
            VisitorId = visitorId.Trim(),
            VisitorName = string.IsNullOrWhiteSpace(visitorName) ? null : visitorName.Trim(),
            Status = ChatSessionStatus.Open,
            CreatedAtUtc = now,
            UpdatedAtUtc = now,
            Messages =
            [
                new ChatMessageDto
                {
                    Id = Guid.NewGuid().ToString("N"),
                    SessionId = "",
                    Sender = ChatSender.System,
                    SenderName = "سیستم",
                    Text = "سلام! چطور می‌توانیم کمک کنیم؟",
                    CreatedAtUtc = now,
                },
            ],
        };
        session.Messages[0].SessionId = session.Id;
        _sessions[session.Id] = session;
        return Clone(session);
    }

    public ChatSessionDto? Get(string sessionId)
    {
        return _sessions.TryGetValue(sessionId, out var session) ? Clone(session) : null;
    }

    public IReadOnlyList<ChatSessionDto> ListOpen()
    {
        return _sessions.Values
            .Where(s => s.Status is ChatSessionStatus.Open or ChatSessionStatus.Assigned)
            .OrderByDescending(s => s.UpdatedAtUtc)
            .Select(Clone)
            .ToList();
    }

    public ChatMessageDto? AddMessage(
        string sessionId,
        ChatSender sender,
        string senderName,
        string text,
        ChatAttachmentDto? attachment = null)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
        {
            return null;
        }

        if (session.Status == ChatSessionStatus.Closed)
        {
            return null;
        }

        var message = new ChatMessageDto
        {
            Id = Guid.NewGuid().ToString("N"),
            SessionId = session.Id,
            Sender = sender,
            SenderName = senderName.Trim(),
            Text = text?.Trim() ?? "",
            Attachment = attachment,
            CreatedAtUtc = DateTimeOffset.UtcNow,
        };

        lock (session)
        {
            session.Messages.Add(message);
            session.UpdatedAtUtc = message.CreatedAtUtc;
        }

        return CloneMessage(message);
    }

    public bool AssignAgent(string sessionId, string agentId, string agentName)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
        {
            return false;
        }

        lock (session)
        {
            session.AgentId = agentId;
            session.AgentName = agentName;
            session.Status = ChatSessionStatus.Assigned;
            session.UpdatedAtUtc = DateTimeOffset.UtcNow;
        }

        return true;
    }

    public bool Close(string sessionId)
    {
        if (!_sessions.TryGetValue(sessionId, out var session))
        {
            return false;
        }

        lock (session)
        {
            session.Status = ChatSessionStatus.Closed;
            session.UpdatedAtUtc = DateTimeOffset.UtcNow;
        }

        return true;
    }

    private static ChatSessionDto Clone(ChatSessionDto s) =>
        new()
        {
            Id = s.Id,
            VisitorId = s.VisitorId,
            VisitorName = s.VisitorName,
            Status = s.Status,
            AgentId = s.AgentId,
            AgentName = s.AgentName,
            CreatedAtUtc = s.CreatedAtUtc,
            UpdatedAtUtc = s.UpdatedAtUtc,
            Messages = s.Messages.Select(CloneMessage).ToList(),
        };

    private static ChatMessageDto CloneMessage(ChatMessageDto m) =>
        new()
        {
            Id = m.Id,
            SessionId = m.SessionId,
            Sender = m.Sender,
            SenderName = m.SenderName,
            Text = m.Text,
            Attachment = m.Attachment is null
                ? null
                : new ChatAttachmentDto
                {
                    Id = m.Attachment.Id,
                    FileName = m.Attachment.FileName,
                    ContentType = m.Attachment.ContentType,
                    Url = m.Attachment.Url,
                    SizeBytes = m.Attachment.SizeBytes,
                },
            CreatedAtUtc = m.CreatedAtUtc,
        };
}
