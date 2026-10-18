using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Hosting;
using MixPlus.Modules.Support.Infrastructure;

namespace MixPlus.Modules.Support.Api;

internal static class SupportChatEndpoints
{
    private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "application/pdf",
        "text/plain",
    };

    public static void MapSupportChatEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var chat = endpoints.MapGroup("/api/support/chat").WithTags("SupportChat");
        chat.MapPost("/sessions", CreateSession).WithName("SupportCreateChatSession");
        chat.MapGet("/sessions/{sessionId}", GetSession).WithName("SupportGetChatSession");
        chat.MapGet("/sessions/{sessionId}/messages", GetMessages).WithName("SupportGetChatMessages");
        chat.MapPost("/sessions/{sessionId}/messages", SendVisitorMessage).WithName("SupportSendVisitorMessage");
        chat.MapPost("/sessions/{sessionId}/attachments", UploadAttachment).DisableAntiforgery()
            .WithName("SupportUploadChatAttachment");
        chat.MapGet("/attachments/{fileId}/{fileName}", GetAttachment).WithName("SupportGetChatAttachment");

        var agents = endpoints.MapGroup("/api/support/agents").WithTags("SupportAgents");
        agents.MapGet("/", ListAgents).WithName("SupportListAgents");
        agents.MapPost("/register", RegisterAgent).WithName("SupportRegisterAgent");
        agents.MapPost("/{agentId}/heartbeat", HeartbeatAgent).WithName("SupportAgentHeartbeat");
        agents.MapPost("/{agentId}/offline", OfflineAgent).WithName("SupportAgentOffline");

        var admin = endpoints.MapGroup("/api/admin/support/chat").WithTags("AdminSupportChat");
        admin.MapGet("/sessions", ListOpenSessions).WithName("AdminListSupportSessions");
        admin.MapPost("/sessions/{sessionId}/claim", ClaimSession).WithName("AdminClaimSupportSession");
        admin.MapPost("/sessions/{sessionId}/messages", SendAgentMessage).WithName("AdminSendSupportMessage");
        admin.MapPost("/sessions/{sessionId}/close", CloseSession).WithName("AdminCloseSupportSession");
    }

    private static IResult CreateSession(
        CreateSessionRequest body,
        IChatSessionStore store)
    {
        var visitorId = string.IsNullOrWhiteSpace(body.VisitorId)
            ? Guid.NewGuid().ToString("N")
            : body.VisitorId.Trim();
        var session = store.Create(visitorId, body.VisitorName);
        return Results.Created($"/api/support/chat/sessions/{session.Id}", session);
    }

    private static IResult GetSession(string sessionId, IChatSessionStore store)
    {
        var session = store.Get(sessionId);
        return session is null
            ? Results.NotFound(new { error = "گفتگو یافت نشد" })
            : Results.Ok(session);
    }

    private static IResult GetMessages(
        string sessionId,
        IChatSessionStore store,
        DateTimeOffset? after = null)
    {
        var session = store.Get(sessionId);
        if (session is null)
        {
            return Results.NotFound(new { error = "گفتگو یافت نشد" });
        }

        var messages = after is null
            ? session.Messages
            : session.Messages.Where(m => m.CreatedAtUtc > after.Value).ToList();

        return Results.Ok(new
        {
            sessionId = session.Id,
            status = session.Status.ToString().ToLowerInvariant(),
            agentName = session.AgentName,
            messages,
        });
    }

    private static async Task<IResult> SendVisitorMessage(
        string sessionId,
        SendMessageRequest body,
        IChatSessionStore store,
        IAgentRegistry agents,
        IChatBotHook bot,
        CancellationToken ct)
    {
        var session = store.Get(sessionId);
        if (session is null)
        {
            return Results.NotFound(new { error = "گفتگو یافت نشد" });
        }

        if (string.IsNullOrWhiteSpace(body.Text) && body.Attachment is null)
        {
            return Results.BadRequest(new { error = "متن یا پیوست لازم است" });
        }

        var visitorName = string.IsNullOrWhiteSpace(body.SenderName)
            ? session.VisitorName ?? "مشتری"
            : body.SenderName.Trim();

        var message = store.AddMessage(
            sessionId,
            ChatSender.Visitor,
            visitorName,
            body.Text ?? "",
            body.Attachment);
        if (message is null)
        {
            return Results.BadRequest(new { error = "امکان ارسال پیام نیست" });
        }

        // Auto-assign an online agent when available; otherwise bot hook replies.
        if (session.AgentId is null)
        {
            var online = agents.PickOnlineAgent();
            if (online is not null)
            {
                store.AssignAgent(sessionId, online.Id, online.DisplayName);
                store.AddMessage(
                    sessionId,
                    ChatSender.System,
                    "سیستم",
                    $"{online.DisplayName} به گفتگو پیوست.");
            }
            else
            {
                var reply = await bot.TryReplyAsync(store.Get(sessionId)!, message, ct);
                if (!string.IsNullOrWhiteSpace(reply))
                {
                    store.AddMessage(sessionId, ChatSender.Bot, "ربات پشتیبانی", reply);
                }
            }
        }

        return Results.Ok(store.Get(sessionId));
    }

    private static async Task<IResult> UploadAttachment(
        string sessionId,
        HttpRequest request,
        IChatSessionStore store,
        IHostEnvironment env,
        CancellationToken ct)
    {
        if (store.Get(sessionId) is null)
        {
            return Results.NotFound(new { error = "گفتگو یافت نشد" });
        }

        if (!request.HasFormContentType)
        {
            return Results.BadRequest(new { error = "فرم چندبخشی لازم است" });
        }

        var form = await request.ReadFormAsync(ct);
        var file = form.Files.GetFile("file") ?? form.Files.FirstOrDefault();
        if (file is null || file.Length == 0)
        {
            return Results.BadRequest(new { error = "فایل ارسال نشده" });
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return Results.BadRequest(new { error = "حداکثر حجم فایل ۵ مگابایت است" });
        }

        var contentType = string.IsNullOrWhiteSpace(file.ContentType)
            ? "application/octet-stream"
            : file.ContentType;
        if (!AllowedContentTypes.Contains(contentType))
        {
            return Results.BadRequest(new { error = "نوع فایل مجاز نیست" });
        }

        var fileId = Guid.NewGuid().ToString("N");
        var safeName = Path.GetFileName(file.FileName);
        if (string.IsNullOrWhiteSpace(safeName))
        {
            safeName = "file";
        }

        var dir = Path.Combine(env.ContentRootPath, "storage", "chat", sessionId);
        Directory.CreateDirectory(dir);
        var diskPath = Path.Combine(dir, $"{fileId}_{safeName}");
        await using (var stream = File.Create(diskPath))
        {
            await file.CopyToAsync(stream, ct);
        }

        var attachment = new ChatAttachmentDto
        {
            Id = fileId,
            FileName = safeName,
            ContentType = contentType,
            Url = $"/api/support/chat/attachments/{fileId}/{Uri.EscapeDataString(safeName)}?sessionId={sessionId}",
            SizeBytes = file.Length,
        };

        return Results.Ok(attachment);
    }

    private static IResult GetAttachment(
        string fileId,
        string fileName,
        string? sessionId,
        IHostEnvironment env)
    {
        if (string.IsNullOrWhiteSpace(sessionId))
        {
            return Results.BadRequest(new { error = "sessionId لازم است" });
        }

        var safeName = Path.GetFileName(fileName);
        var path = Path.Combine(env.ContentRootPath, "storage", "chat", sessionId, $"{fileId}_{safeName}");
        if (!File.Exists(path))
        {
            return Results.NotFound();
        }

        var contentType = "application/octet-stream";
        var ext = Path.GetExtension(safeName).ToLowerInvariant();
        contentType = ext switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".webp" => "image/webp",
            ".gif" => "image/gif",
            ".pdf" => "application/pdf",
            ".txt" => "text/plain",
            _ => contentType,
        };

        return Results.File(path, contentType, enableRangeProcessing: true);
    }

    private static IResult ListAgents(IAgentRegistry registry, bool onlineOnly = false) =>
        Results.Ok(registry.List(onlineOnly));

    private static IResult RegisterAgent(RegisterAgentRequest body, IAgentRegistry registry)
    {
        if (string.IsNullOrWhiteSpace(body.DisplayName))
        {
            return Results.BadRequest(new { error = "نام کارشناس الزامی است" });
        }

        var agent = registry.Register(body.DisplayName, body.AgentId);
        return Results.Ok(agent);
    }

    private static IResult HeartbeatAgent(string agentId, IAgentRegistry registry)
    {
        var agent = registry.Heartbeat(agentId);
        return agent is null
            ? Results.NotFound(new { error = "کارشناس یافت نشد" })
            : Results.Ok(agent);
    }

    private static IResult OfflineAgent(string agentId, IAgentRegistry registry)
    {
        registry.SetOffline(agentId);
        return Results.Ok(new { ok = true });
    }

    private static IResult ListOpenSessions(IChatSessionStore store) =>
        Results.Ok(store.ListOpen());

    private static IResult ClaimSession(
        string sessionId,
        ClaimSessionRequest body,
        IChatSessionStore store,
        IAgentRegistry registry)
    {
        if (string.IsNullOrWhiteSpace(body.AgentId))
        {
            return Results.BadRequest(new { error = "agentId لازم است" });
        }

        var agent = registry.Heartbeat(body.AgentId) ?? registry.Get(body.AgentId);
        if (agent is null)
        {
            return Results.BadRequest(new { error = "ابتدا به‌عنوان کارشناس ثبت شوید" });
        }

        if (!store.AssignAgent(sessionId, agent.Id, agent.DisplayName))
        {
            return Results.NotFound(new { error = "گفتگو یافت نشد" });
        }

        store.AddMessage(
            sessionId,
            ChatSender.System,
            "سیستم",
            $"{agent.DisplayName} گفتگو را پذیرفت.");

        return Results.Ok(store.Get(sessionId));
    }

    private static IResult SendAgentMessage(
        string sessionId,
        SendMessageRequest body,
        IChatSessionStore store,
        IAgentRegistry registry)
    {
        if (string.IsNullOrWhiteSpace(body.AgentId))
        {
            return Results.BadRequest(new { error = "agentId لازم است" });
        }

        var agent = registry.Heartbeat(body.AgentId) ?? registry.Get(body.AgentId);
        if (agent is null)
        {
            return Results.BadRequest(new { error = "کارشناس معتبر نیست" });
        }

        if (string.IsNullOrWhiteSpace(body.Text) && body.Attachment is null)
        {
            return Results.BadRequest(new { error = "متن یا پیوست لازم است" });
        }

        var session = store.Get(sessionId);
        if (session is null)
        {
            return Results.NotFound(new { error = "گفتگو یافت نشد" });
        }

        if (session.AgentId is null)
        {
            store.AssignAgent(sessionId, agent.Id, agent.DisplayName);
        }

        var message = store.AddMessage(
            sessionId,
            ChatSender.Agent,
            agent.DisplayName,
            body.Text ?? "",
            body.Attachment);

        return message is null
            ? Results.BadRequest(new { error = "امکان ارسال نیست" })
            : Results.Ok(store.Get(sessionId));
    }

    private static IResult CloseSession(string sessionId, IChatSessionStore store)
    {
        if (store.Get(sessionId) is null)
        {
            return Results.NotFound(new { error = "گفتگو یافت نشد" });
        }

        store.AddMessage(sessionId, ChatSender.System, "سیستم", "گفتگو پایان یافت.");
        store.Close(sessionId);
        return Results.Ok(store.Get(sessionId));
    }

    private sealed record CreateSessionRequest(string? VisitorId, string? VisitorName);
    private sealed record SendMessageRequest(
        string? Text,
        string? SenderName,
        string? AgentId,
        ChatAttachmentDto? Attachment);
    private sealed record RegisterAgentRequest(string DisplayName, string? AgentId);
    private sealed record ClaimSessionRequest(string AgentId);
}
