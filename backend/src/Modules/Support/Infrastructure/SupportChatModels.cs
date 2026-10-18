namespace MixPlus.Modules.Support.Infrastructure;

public enum ChatSender
{
    Visitor = 0,
    Agent = 1,
    Bot = 2,
    System = 3,
}

public enum ChatSessionStatus
{
    Open = 0,
    Assigned = 1,
    Closed = 2,
}

public sealed class ChatAttachmentDto
{
    public string Id { get; set; } = "";
    public string FileName { get; set; } = "";
    public string ContentType { get; set; } = "";
    public string Url { get; set; } = "";
    public long SizeBytes { get; set; }
}

public sealed class ChatMessageDto
{
    public string Id { get; set; } = "";
    public string SessionId { get; set; } = "";
    public ChatSender Sender { get; set; }
    public string SenderName { get; set; } = "";
    public string Text { get; set; } = "";
    public ChatAttachmentDto? Attachment { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}

public sealed class ChatSessionDto
{
    public string Id { get; set; } = "";
    public string VisitorId { get; set; } = "";
    public string? VisitorName { get; set; }
    public ChatSessionStatus Status { get; set; }
    public string? AgentId { get; set; }
    public string? AgentName { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset UpdatedAtUtc { get; set; }
    public List<ChatMessageDto> Messages { get; set; } = [];
}

public sealed class ChatAgentDto
{
    public string Id { get; set; } = "";
    public string DisplayName { get; set; } = "";
    public bool IsOnline { get; set; }
    public DateTimeOffset LastSeenAtUtc { get; set; }
}
