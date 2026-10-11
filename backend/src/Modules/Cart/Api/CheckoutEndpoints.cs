using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Cart.Domain;
using MixPlus.Modules.Cart.Infrastructure.Persistence;

namespace MixPlus.Modules.Cart.Api;

internal static class CheckoutEndpoints
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    public static void MapCheckoutEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var addresses = endpoints.MapGroup("/api/checkout/addresses").WithTags("Checkout");
        addresses.MapGet("/", ListAddresses).WithName("ListCheckoutAddresses");
        addresses.MapPost("/", CreateAddress).WithName("CreateCheckoutAddress");
        addresses.MapPut("/{id:guid}", UpdateAddress).WithName("UpdateCheckoutAddress");
        addresses.MapDelete("/{id:guid}", DeleteAddress).WithName("DeleteCheckoutAddress");

        var checkout = endpoints.MapGroup("/api/checkout").WithTags("Checkout");
        checkout.MapGet("/shipping-options", GetShippingOptions).WithName("GetShippingOptions");
        checkout.MapGet("/pickup-branches", GetPickupBranches).WithName("GetPickupBranches");
        checkout.MapPost("/quote", QuoteCheckout).WithName("QuoteCheckout");
        checkout.MapPost("/payments", StartPayment).WithName("StartCheckoutPayment");
        checkout.MapGet("/payments/{id}", GetPayment).WithName("GetCheckoutPayment");
        checkout.MapPost("/payments/{id}/callback", PaymentCallback).WithName("CheckoutPaymentCallback");
        checkout.MapPost("/payments/{id}/retry", RetryPayment).WithName("RetryCheckoutPayment");
        checkout.MapGet("/orders/{id}", GetOrder).WithName("GetCheckoutOrder");

        var orders = endpoints.MapGroup("/api/orders").WithTags("Orders");
        orders.MapGet("/", ListMyOrders).WithName("ListMyOrders");

        var wallet = endpoints.MapGroup("/api/wallet").WithTags("Wallet");
        wallet.MapGet("/", GetWallet).WithName("GetWallet");
        wallet.MapPost("/topup", TopUpWallet).WithName("TopUpWallet");

        var gifts = endpoints.MapGroup("/api/gift-cards").WithTags("GiftCards");
        gifts.MapGet("/", ListGiftCards).WithName("ListGiftCards");
        gifts.MapPost("/redeem", RedeemGiftCard).WithName("RedeemGiftCard");
    }

    private static async Task<IResult> ListAddresses(
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var userId = Guid.Parse(user.Id);
        var rows = await db.Addresses.AsNoTracking()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.IsDefault)
            .ThenBy(x => x.Title)
            .ToListAsync(ct);
        return Results.Ok(rows.Select(MapAddress));
    }

    private static async Task<IResult> CreateAddress(
        AddressRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var userId = Guid.Parse(user.Id);

        if (body.IsDefault)
        {
            var existing = await db.Addresses.Where(x => x.UserId == userId).ToListAsync(ct);
            foreach (var a in existing) a.SetDefault(false);
        }

        var address = CustomerAddress.Create(
            userId,
            body.Title ?? "آدرس",
            body.ReceiverName ?? user.DisplayName,
            body.Phone ?? user.Phone ?? "",
            body.Province ?? "",
            body.City ?? "",
            body.PostalCode ?? "",
            body.AddressLine ?? "",
            body.IsDefault);
        db.Addresses.Add(address);
        await db.SaveChangesAsync(ct);
        return Results.Ok(MapAddress(address));
    }

    private static async Task<IResult> UpdateAddress(
        Guid id,
        AddressRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var userId = Guid.Parse(user.Id);
        var address = await db.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (address is null) return Results.NotFound();

        if (body.IsDefault)
        {
            var others = await db.Addresses.Where(x => x.UserId == userId && x.Id != id).ToListAsync(ct);
            foreach (var a in others) a.SetDefault(false);
        }

        address.Update(
            body.Title ?? address.Title,
            body.ReceiverName ?? address.ReceiverName,
            body.Phone ?? address.Phone,
            body.Province ?? address.Province,
            body.City ?? address.City,
            body.PostalCode ?? address.PostalCode,
            body.AddressLine ?? address.AddressLine,
            body.IsDefault);
        await db.SaveChangesAsync(ct);
        return Results.Ok(MapAddress(address));
    }

    private static async Task<IResult> DeleteAddress(
        Guid id,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var userId = Guid.Parse(user.Id);
        var address = await db.Addresses.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (address is null) return Results.NotFound();
        db.Addresses.Remove(address);
        await db.SaveChangesAsync(ct);
        return Results.NoContent();
    }

    private static async Task<IResult> GetShippingOptions(
        Guid? addressId,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        string? city = null;
        if (addressId is Guid aid)
        {
            city = await db.Addresses.AsNoTracking()
                .Where(x => x.Id == aid && x.UserId == Guid.Parse(user.Id))
                .Select(x => x.City)
                .FirstOrDefaultAsync(ct);
        }

        return Results.Ok(ShippingOptions.ForCity(city).Select(o => new
        {
            id = o.Id,
            title = o.Title,
            description = o.Description,
            cost = o.Cost,
            minDays = o.MinDays,
            maxDays = o.MaxDays,
            kind = o.Kind,
        }));
    }

    private static IResult GetPickupBranches() =>
        Results.Ok(ShippingOptions.Branches.Select(b => new
        {
            id = b.Id,
            title = b.Title,
            address = b.Address,
            hours = b.Hours,
        }));

    private static async Task<IResult> QuoteCheckout(
        CheckoutQuoteRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var cart = await CartEndpoints.GetOrCreateCartAsync(db, Guid.Parse(user.Id), ct);
        var quote = await BuildQuote(db, coupons, cart, body, ct);
        if (quote.Error is not null)
        {
            return Results.BadRequest(new { error = quote.Error });
        }

        return Results.Ok(quote.Dto);
    }

    private static async Task<IResult> StartPayment(
        CheckoutQuoteRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var userId = Guid.Parse(user.Id);
        var cart = await CartEndpoints.GetOrCreateCartAsync(db, userId, ct);
        if (cart.Lines.Count == 0)
        {
            return Results.BadRequest(new { error = "سبد خرید خالی است" });
        }

        if (cart.Lines.Any(x => !x.InStock))
        {
            return Results.BadRequest(new { error = "برخی کالاها ناموجود هستند — سبد را به‌روز کنید" });
        }

        var quote = await BuildQuote(db, coupons, cart, body, ct);
        if (quote.Error is not null || quote.Payload is null)
        {
            return Results.BadRequest(new { error = quote.Error ?? "خطا در محاسبه تسویه" });
        }

        var payloadJson = JsonSerializer.Serialize(quote.Payload, JsonOptions);
        var payment = PaymentIntent.Create(userId, quote.Payload.PayableTotal, payloadJson);
        db.Payments.Add(payment);
        await db.SaveChangesAsync(ct);

        return Results.Ok(new
        {
            paymentId = payment.Id.ToString("D"),
            paymentKey = payment.ExternalKey,
            amount = payment.Amount,
            currency = payment.Currency,
            status = payment.Status,
            gateway = payment.Gateway,
            redirectUrl = $"/checkout/payment/{payment.Id:D}",
            summary = quote.Dto,
        });
    }

    private static async Task<IResult> GetPayment(
        Guid id,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var payment = await db.Payments.AsNoTracking()
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == Guid.Parse(user.Id), ct);
        if (payment is null) return Results.NotFound();
        return Results.Ok(MapPayment(payment));
    }

    private static async Task<IResult> PaymentCallback(
        Guid id,
        PaymentCallbackRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var userId = Guid.Parse(user.Id);
        var payment = await db.Payments.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId, ct);
        if (payment is null) return Results.NotFound();

        if (payment.Status == "paid" && payment.OrderId is Guid existingOrderId)
        {
            var existing = await db.Orders.AsNoTracking()
                .Include("_lines")
                .FirstOrDefaultAsync(x => x.Id == existingOrderId, ct);
            return Results.Ok(new
            {
                payment = MapPayment(payment),
                order = existing is null ? null : MapOrder(existing),
            });
        }

        if (string.Equals(body.Result, "failed", StringComparison.OrdinalIgnoreCase))
        {
            payment.MarkFailed(body.Reason ?? "پرداخت ناموفق بود");
            await db.SaveChangesAsync(ct);
            return Results.Ok(new { payment = MapPayment(payment), order = (object?)null });
        }

        var payload = JsonSerializer.Deserialize<CheckoutPayload>(payment.CheckoutPayloadJson, JsonOptions);
        if (payload is null)
        {
            payment.MarkFailed("payload نامعتبر");
            await db.SaveChangesAsync(ct);
            return Results.BadRequest(new { error = "اطلاعات پرداخت ناقص است" });
        }

        var cart = await CartEndpoints.GetOrCreateCartAsync(db, userId, ct);
        var wallet = await CartEndpoints.EnsureWalletAsync(db, userId, ct);

        if (payload.WalletApplied > 0 && !wallet.TryDebit(payload.WalletApplied))
        {
            payment.MarkFailed("موجودی کیف پول کافی نیست");
            await db.SaveChangesAsync(ct);
            return Results.BadRequest(new { error = "موجودی کیف پول کافی نیست" });
        }

        if (!string.IsNullOrWhiteSpace(payload.GiftCardCode) && payload.GiftCardApplied > 0)
        {
            var card = await db.GiftCards.FirstOrDefaultAsync(x => x.Code == payload.GiftCardCode, ct);
            if (card is null || card.Redeem(payload.GiftCardApplied) < payload.GiftCardApplied - 0.01m)
            {
                // rollback wallet debit is not auto; credit back
                if (payload.WalletApplied > 0) wallet.Credit(payload.WalletApplied);
                payment.MarkFailed("کارت هدیه قابل استفاده نیست");
                await db.SaveChangesAsync(ct);
                return Results.BadRequest(new { error = "کارت هدیه قابل استفاده نیست" });
            }
        }

        if (!string.IsNullOrWhiteSpace(payload.CouponCode))
        {
            await coupons.IncrementUsageAsync(payload.CouponCode, ct);
        }

        var order = ShopOrder.CreateCheckout(
            userId,
            user.DisplayName,
            Array.Empty<OrderLine>(),
            payload.Subtotal,
            payload.ShippingCost,
            payload.CouponDiscount,
            payload.GiftCardApplied,
            payload.WalletApplied,
            payload.PayableTotal,
            payload.CouponCode,
            payload.ShippingMethodId,
            payload.ShippingLabel,
            payload.PickupBranchId,
            payload.PickupBranchLabel,
            payload.AddressSnapshotJson,
            payload.PayableTotal <= 0 ? "wallet_gift" : "gateway",
            payment.Id);

        var orderLines = cart.Lines.Select(l => OrderLine.FromCartLine(order.Id, l)).ToList();
        foreach (var line in orderLines)
        {
            order.AttachLine(line);
        }

        db.Orders.Add(order);
        db.OrderLines.AddRange(orderLines);
        payment.MarkPaid(order.Id);

        // Clear cart lines after success
        var cartLines = cart.Lines.ToList();
        foreach (var line in cartLines)
        {
            cart.RemoveLine(line.Id);
        }

        db.CartLines.RemoveRange(cartLines);

        cart.SetCoupon(null);
        cart.SetGiftCard(null);
        cart.SetWalletAmount(0);
        await db.SaveChangesAsync(ct);

        // Reload with lines
        var saved = await db.Orders.AsNoTracking()
            .Include("_lines")
            .FirstAsync(x => x.Id == order.Id, ct);

        return Results.Ok(new
        {
            payment = MapPayment(payment),
            order = MapOrder(saved),
        });
    }

    private static async Task<IResult> RetryPayment(
        Guid id,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var payment = await db.Payments.FirstOrDefaultAsync(
            x => x.Id == id && x.UserId == Guid.Parse(user.Id), ct);
        if (payment is null) return Results.NotFound();
        if (payment.Status == "paid")
        {
            return Results.BadRequest(new { error = "این پرداخت قبلاً موفق بوده است" });
        }

        payment.ResetForRetry();
        await db.SaveChangesAsync(ct);
        return Results.Ok(new
        {
            paymentId = payment.Id.ToString("D"),
            redirectUrl = $"/checkout/payment/{payment.Id:D}",
            payment = MapPayment(payment),
        });
    }

    private static async Task<IResult> GetOrder(
        Guid id,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var order = await db.Orders.AsNoTracking()
            .Include("_lines")
            .FirstOrDefaultAsync(x => x.Id == id && x.UserId == Guid.Parse(user.Id), ct);
        if (order is null) return Results.NotFound();
        return Results.Ok(MapOrder(order));
    }

    private static async Task<IResult> ListMyOrders(
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var orders = await db.Orders.AsNoTracking()
            .Include("_lines")
            .Where(x => x.UserId == Guid.Parse(user.Id))
            .OrderByDescending(x => x.CreatedAtUtc)
            .Take(50)
            .ToListAsync(ct);
        return Results.Ok(orders.Select(MapOrder));
    }

    private static async Task<IResult> GetWallet(
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var wallet = await CartEndpoints.EnsureWalletAsync(db, Guid.Parse(user.Id), ct);
        return Results.Ok(new { balance = wallet.Balance, currency = wallet.Currency });
    }

    private static async Task<IResult> TopUpWallet(
        TopUpRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var wallet = await CartEndpoints.EnsureWalletAsync(db, Guid.Parse(user.Id), ct);
        wallet.Credit(body.Amount <= 0 ? 500_000m : body.Amount);
        await db.SaveChangesAsync(ct);
        return Results.Ok(new { balance = wallet.Balance, currency = wallet.Currency });
    }

    private static async Task<IResult> ListGiftCards(
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var userId = Guid.Parse(user.Id);
        var cards = await db.GiftCards.AsNoTracking()
            .Where(x => x.RedeemedByUserId == userId)
            .OrderByDescending(x => x.ExpiresAtUtc)
            .ToListAsync(ct);
        return Results.Ok(cards.Select(c => new
        {
            id = c.Id.ToString("D"),
            code = c.Code,
            balance = c.Balance,
            expiresAt = c.ExpiresAtUtc,
            status = c.Status,
        }));
    }

    private static async Task<IResult> RedeemGiftCard(
        CodeBody body,
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();
        var code = (body.Code ?? "").Trim().ToUpperInvariant();
        var card = await db.GiftCards.FirstOrDefaultAsync(x => x.Code == code, ct);
        if (card is null && code.StartsWith("GIFT-", StringComparison.OrdinalIgnoreCase))
        {
            card = GiftCardLedger.Issue(code, 500_000m, DateTime.UtcNow.AddYears(1));
            db.GiftCards.Add(card);
        }

        if (card is null)
        {
            return Results.BadRequest(new { error = "کارت هدیه یافت نشد" });
        }

        card.ExpireIfNeeded(DateTime.UtcNow);
        if (!card.IsUsable(DateTime.UtcNow))
        {
            return Results.BadRequest(new { error = "کارت هدیه قابل استفاده نیست" });
        }

        card.AssignTo(Guid.Parse(user.Id));
        await db.SaveChangesAsync(ct);
        return Results.Ok(new
        {
            id = card.Id.ToString("D"),
            code = card.Code,
            balance = card.Balance,
            expiresAt = card.ExpiresAtUtc,
            status = card.Status,
        });
    }

    private static async Task<(object? Dto, CheckoutPayload? Payload, string? Error)> BuildQuote(
        CartDbContext db,
        ICouponValidationPort coupons,
        ShoppingCart cart,
        CheckoutQuoteRequest body,
        CancellationToken ct)
    {
        if (cart.Lines.Count == 0)
        {
            return (null, null, "سبد خرید خالی است");
        }

        CustomerAddress? address = null;
        if (string.Equals(body.ShippingMethodId, "pickup", StringComparison.OrdinalIgnoreCase))
        {
            // pickup does not require home address
        }
        else if (body.AddressId is Guid aid)
        {
            address = await db.Addresses.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == aid && x.UserId == cart.UserId, ct);
            if (address is null) return (null, null, "آدرس انتخاب‌شده معتبر نیست");
        }
        else
        {
            return (null, null, "آدرس تحویل را انتخاب کنید");
        }

        var shipping = ShippingOptions.Find(body.ShippingMethodId, address?.City);
        if (shipping is null) return (null, null, "روش ارسال نامعتبر است");

        string? pickupId = null;
        string? pickupLabel = null;
        if (shipping.Kind == "pickup")
        {
            var branch = ShippingOptions.FindBranch(body.PickupBranchId);
            if (branch is null) return (null, null, "شعبه تحویل را انتخاب کنید");
            pickupId = branch.Id;
            pickupLabel = $"{branch.Title} — {branch.Address}";
        }

        var subtotal = cart.Lines.Sum(x => x.UnitPrice * x.Quantity);
        var couponCode = body.CouponCode ?? cart.CouponCode;
        decimal couponDiscount = 0;
        string? couponLabel = null;
        if (!string.IsNullOrWhiteSpace(couponCode))
        {
            var quote = await coupons.ValidateAsync(couponCode, subtotal, ct);
            if (!quote.IsValid) return (null, null, quote.Error);
            couponDiscount = quote.DiscountAmount;
            couponLabel = quote.DiscountLabel;
            couponCode = quote.Code;
        }

        var afterCoupon = Math.Max(0, subtotal - couponDiscount);
        var giftCode = body.GiftCardCode ?? cart.GiftCardCode;
        decimal giftApplied = 0;
        if (!string.IsNullOrWhiteSpace(giftCode))
        {
            var card = await db.GiftCards.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Code == giftCode, ct);
            if (card is not null
                && card.Status == "active"
                && card.Balance > 0
                && card.ExpiresAtUtc > DateTime.UtcNow)
            {
                giftApplied = Math.Min(card.Balance, afterCoupon + shipping.Cost);
            }
        }

        var afterGift = Math.Max(0, afterCoupon + shipping.Cost - giftApplied);
        var wallet = await db.Wallets.AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == cart.UserId, ct);
        var walletBalance = wallet?.Balance ?? 0m;
        var walletRequested = body.WalletAmount ?? cart.WalletAmountApplied;
        var walletApplied = Math.Clamp(walletRequested, 0, Math.Min(walletBalance, afterGift));
        var payable = Math.Max(0, afterGift - walletApplied);

        var addressJson = address is null
            ? "{}"
            : JsonSerializer.Serialize(MapAddress(address), JsonOptions);

        var payload = new CheckoutPayload(
            Subtotal: subtotal,
            ShippingCost: shipping.Cost,
            CouponCode: couponCode,
            CouponDiscount: couponDiscount,
            GiftCardCode: giftCode,
            GiftCardApplied: giftApplied,
            WalletApplied: walletApplied,
            PayableTotal: payable,
            ShippingMethodId: shipping.Id,
            ShippingLabel: shipping.Title,
            PickupBranchId: pickupId,
            PickupBranchLabel: pickupLabel,
            AddressSnapshotJson: addressJson,
            AddressId: address?.Id);

        var dto = new
        {
            subtotal,
            shippingCost = shipping.Cost,
            shippingMethodId = shipping.Id,
            shippingLabel = shipping.Title,
            pickupBranchId = pickupId,
            pickupBranchLabel = pickupLabel,
            couponCode,
            couponLabel,
            couponDiscount,
            giftCardCode = giftCode,
            giftCardApplied = giftApplied,
            walletBalance,
            walletApplied,
            payableTotal = payable,
            currency = "IRT",
            itemCount = cart.Lines.Sum(x => x.Quantity),
            address = address is null ? null : MapAddress(address),
        };

        return (dto, payload, null);
    }

    private static object MapAddress(CustomerAddress a) => new
    {
        id = a.Id.ToString("D"),
        title = a.Title,
        receiverName = a.ReceiverName,
        phone = a.Phone,
        province = a.Province,
        city = a.City,
        postalCode = a.PostalCode,
        addressLine = a.AddressLine,
        isDefault = a.IsDefault,
    };

    private static object MapPayment(PaymentIntent p) => new
    {
        id = p.Id.ToString("D"),
        key = p.ExternalKey,
        amount = p.Amount,
        currency = p.Currency,
        status = p.Status,
        gateway = p.Gateway,
        failureReason = p.FailureReason,
        orderId = p.OrderId?.ToString("D"),
        createdAt = p.CreatedAtUtc,
        completedAt = p.CompletedAtUtc,
        redirectUrl = $"/checkout/payment/{p.Id:D}",
    };

    private static object MapOrder(ShopOrder o) => new
    {
        id = o.Id.ToString("D"),
        code = o.ExternalKey,
        status = o.Status,
        customerName = o.CustomerName,
        subtotal = o.SubtotalAmount,
        shipping = o.ShippingAmount,
        discount = o.DiscountAmount,
        giftCard = o.GiftCardAmount,
        wallet = o.WalletAmount,
        totalAmount = o.TotalAmount,
        currency = o.Currency,
        couponCode = o.CouponCode,
        shippingMethod = o.ShippingMethod,
        shippingLabel = o.ShippingLabel,
        pickupBranchId = o.PickupBranchId,
        pickupBranchLabel = o.PickupBranchLabel,
        paymentMethod = o.PaymentMethod,
        createdAt = o.CreatedAtUtc,
        itemCount = o.Lines.Sum(x => x.Quantity),
        items = o.Lines.Select(l => new
        {
            id = l.Id.ToString("D"),
            productSlug = l.ProductSlug,
            title = l.Title,
            imageUrl = l.ImageUrl,
            sellerName = l.SellerName,
            variantLabel = l.VariantLabel,
            unitPrice = l.UnitPrice,
            quantity = l.Quantity,
            currency = l.Currency,
        }),
    };

    private sealed record AddressRequest(
        string? Title,
        string? ReceiverName,
        string? Phone,
        string? Province,
        string? City,
        string? PostalCode,
        string? AddressLine,
        bool IsDefault);

    private sealed record CheckoutQuoteRequest(
        Guid? AddressId,
        string? ShippingMethodId,
        string? PickupBranchId,
        string? CouponCode,
        string? GiftCardCode,
        decimal? WalletAmount);

    private sealed record PaymentCallbackRequest(string? Result, string? Reason);

    private sealed record TopUpRequest(decimal Amount);

    private sealed record CodeBody(string? Code);

    internal sealed record CheckoutPayload(
        decimal Subtotal,
        decimal ShippingCost,
        string? CouponCode,
        decimal CouponDiscount,
        string? GiftCardCode,
        decimal GiftCardApplied,
        decimal WalletApplied,
        decimal PayableTotal,
        string ShippingMethodId,
        string ShippingLabel,
        string? PickupBranchId,
        string? PickupBranchLabel,
        string AddressSnapshotJson,
        Guid? AddressId);
}
