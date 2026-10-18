namespace MixPlus.Modules.Support.Infrastructure;

/// <summary>
/// Future AI-bot integration point. Current default returns a short canned reply
/// when no live agent is online.
/// </summary>
public interface IChatBotHook
{
    Task<string?> TryReplyAsync(ChatSessionDto session, ChatMessageDto visitorMessage, CancellationToken ct = default);
}

public sealed class CannedChatBotHook : IChatBotHook
{
    public Task<string?> TryReplyAsync(
        ChatSessionDto session,
        ChatMessageDto visitorMessage,
        CancellationToken ct = default)
    {
        var text = visitorMessage.Text?.Trim() ?? "";
        if (string.IsNullOrWhiteSpace(text) && visitorMessage.Attachment is not null)
        {
            return Task.FromResult<string?>(
                "فایل شما دریافت شد. کارشناسان ما به‌زودی پاسخ می‌دهند.");
        }

        return Task.FromResult<string?>(
            "پیام شما ثبت شد. اگر کارشناس آنلاین باشد به‌زودی پاسخ می‌دهد؛ در غیر این صورت در ساعات کاری با شما تماس می‌گیریم.");
    }
}
