using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.Modules.Cart.Domain;
using MixPlus.Modules.Cart.Infrastructure.Persistence;

namespace MixPlus.Modules.Cart.Api;

internal static class CartEndpoints
{
    public static void MapCartEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/cart").WithTags("Cart");

        group.MapGet("/", GetCart).WithName("GetCart");
        group.MapGet("/count", GetCount).WithName("GetCartCount");
        group.MapPost("/items", AddItem).WithName("AddCartItem");
        group.MapPatch("/items/{lineId:guid}", UpdateItem).WithName("UpdateCartItem");
        group.MapDelete("/items/{lineId:guid}", RemoveItem).WithName("RemoveCartItem");
        group.MapPost("/revalidate", Revalidate).WithName("RevalidateCart");
        group.MapPost("/merge", MergeGuestCart).WithName("MergeGuestCart");
        group.MapPost("/coupon", ApplyCoupon).WithName("ApplyCartCoupon");
        group.MapDelete("/coupon", ClearCoupon).WithName("ClearCartCoupon");
        group.MapPost("/gift-card", ApplyGiftCard).WithName("ApplyCartGiftCard");
        group.MapDelete("/gift-card", ClearGiftCard).WithName("ClearCartGiftCard");
        group.MapPost("/wallet", ApplyWallet).WithName("ApplyCartWallet");
    }

    private static async Task<IResult> GetCart(
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();

        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> GetCount(
        HttpRequest request,
        IShopperSessionPort sessions,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Ok(new { count = 0 });

        var cartId = await db.Carts.AsNoTracking()
            .Where(x => x.UserId == owner.CartUserId)
            .Select(x => (Guid?)x.Id)
            .FirstOrDefaultAsync(ct);
        if (cartId is null) return Results.Ok(new { count = 0 });

        var count = await db.CartLines.AsNoTracking()
            .Where(x => x.CartId == cartId)
            .SumAsync(x => x.Quantity, ct);
        return Results.Ok(new { count });
    }

    private static async Task<IResult> AddItem(
        AddCartItemRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        IProductCardReadPort catalog,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();
        if (string.IsNullOrWhiteSpace(body.ProductSlug) || string.IsNullOrWhiteSpace(body.OfferExternalKey))
        {
            return Results.BadRequest(new { error = "محصول و فروشنده الزامی است" });
        }

        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        var live = await TryLiveSnapshot(catalog, body.ProductSlug, ct);

        var unitPrice = body.UnitPrice > 0 ? body.UnitPrice : live?.Price.Amount ?? 0;
        var stock = body.StockAvailable ?? (live?.InStock == true ? 10 : 0);
        if (stock <= 0 && live?.InStock == true) stock = 10;

        var qty = body.Quantity <= 0 ? 1 : body.Quantity;
        var skuKey = string.IsNullOrWhiteSpace(body.SkuExternalKey)
            ? "default"
            : body.SkuExternalKey.Trim();
        var offerKey = body.OfferExternalKey.Trim();
        var slug = body.ProductSlug.Trim().ToLowerInvariant();

        var existing = cart.Lines.FirstOrDefault(x =>
            x.ProductSlug == slug
            && x.OfferExternalKey == offerKey
            && x.SkuExternalKey == skuKey);

        if (existing is not null)
        {
            if (!existing.InStock)
            {
                return Results.BadRequest(new { error = "این کالا در حال حاضر موجود نیست" });
            }

            existing.SetQuantity(existing.Quantity + qty);
            cart.Touch();
        }
        else
        {
            var line = CartLine.Create(
                cart.Id,
                body.ProductSlug,
                body.OfferExternalKey,
                skuKey,
                body.SellerExternalKey ?? body.OfferExternalKey,
                body.SellerName ?? live?.SellerName ?? "فروشنده",
                body.Title ?? live?.Title ?? body.ProductSlug,
                body.ImageUrl ?? live?.ImageUrl ?? string.Empty,
                body.VariantLabel,
                unitPrice,
                body.OriginalPrice ?? live?.OriginalPrice?.Amount,
                body.DiscountPercent ?? live?.DiscountPercent,
                body.Currency ?? live?.Price.Currency ?? "IRT",
                qty,
                stock);

            if (!line.InStock)
            {
                return Results.BadRequest(new { error = "این کالا در حال حاضر موجود نیست" });
            }

            // Must Add via DbSet: field-backed collection + client Guids otherwise
            // get tracked as Modified and SaveChanges issues UPDATE → concurrency 500.
            cart.AddOrIncrement(line);
            db.CartLines.Add(line);
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> UpdateItem(
        Guid lineId,
        UpdateCartItemRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();

        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        var line = cart.FindLine(lineId);
        if (line is null) return Results.NotFound(new { error = "آیتم سبد یافت نشد" });

        if (!line.InStock)
        {
            return Results.BadRequest(new { error = "این کالا ناموجود است" });
        }

        line.SetQuantity(body.Quantity);
        cart.Touch();
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> RemoveItem(
        Guid lineId,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();

        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        var line = cart.FindLine(lineId);
        if (line is null)
        {
            return Results.NotFound(new { error = "آیتم سبد یافت نشد" });
        }

        cart.RemoveLine(lineId);
        db.CartLines.Remove(line);
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> Revalidate(
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        IProductCardReadPort catalog,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();

        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        var changed = false;
        foreach (var line in cart.Lines.ToList())
        {
            var live = await TryLiveSnapshot(catalog, line.ProductSlug, ct);
            if (live is null)
            {
                line.ApplyLivePricing(line.UnitPrice, line.OriginalPrice, line.DiscountPercent, 0);
                changed = true;
                continue;
            }

            var stock = live.InStock ? Math.Max(line.StockAvailable, 1) : 0;
            line.ApplyLivePricing(
                live.Price.Amount > 0 ? live.Price.Amount : line.UnitPrice,
                live.OriginalPrice?.Amount ?? line.OriginalPrice,
                live.DiscountPercent ?? line.DiscountPercent,
                stock);
            changed = true;
        }

        if (changed)
        {
            cart.Touch();
            await db.SaveChangesAsync(ct);
        }

        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> ApplyCoupon(
        CodeRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();

        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        var subtotal = cart.Lines.Sum(x => x.UnitPrice * x.Quantity);
        var quote = await coupons.ValidateAsync(body.Code ?? "", subtotal, ct);
        if (!quote.IsValid)
        {
            return Results.BadRequest(new { error = quote.Error ?? "کد نامعتبر است" });
        }

        cart.SetCoupon(quote.Code);
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> ClearCoupon(
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();
        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        cart.SetCoupon(null);
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> ApplyGiftCard(
        CodeRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();

        var code = (body.Code ?? "").Trim().ToUpperInvariant();
        var card = await db.GiftCards
            .FirstOrDefaultAsync(x => x.Code == code, ct);
        if (card is null)
        {
            // Auto-issue demo cards for codes starting with GIFT-
            if (code.StartsWith("GIFT-", StringComparison.OrdinalIgnoreCase))
            {
                card = GiftCardLedger.Issue(code, 500_000m, DateTime.UtcNow.AddYears(1));
                db.GiftCards.Add(card);
            }
            else
            {
                return Results.BadRequest(new { error = "کارت هدیه یافت نشد" });
            }
        }

        card.ExpireIfNeeded(DateTime.UtcNow);
        if (!card.IsUsable(DateTime.UtcNow))
        {
            return Results.BadRequest(new { error = "کارت هدیه قابل استفاده نیست" });
        }

        card.AssignTo(owner.CartUserId);
        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        cart.SetGiftCard(card.Code);
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> ClearGiftCard(
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var owner = await CartAuth.ResolveCartOwner(request, sessions, ct);
        if (owner is null) return Results.Unauthorized();
        var cart = await GetOrCreateCartAsync(db, owner.CartUserId, ct);
        cart.SetGiftCard(null);
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    private static async Task<IResult> ApplyWallet(
        WalletRequest body,
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        // Wallet balance belongs to a real shopper account.
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null) return Results.Unauthorized();

        var userId = Guid.Parse(user.Id);
        var wallet = await EnsureWalletAsync(db, userId, ct);
        var cart = await GetOrCreateCartAsync(db, userId, ct);
        var amount = Math.Clamp(body.Amount, 0, wallet.Balance);
        cart.SetWalletAmount(amount);
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, cart, ct));
    }

    /// <summary>
    /// After login: move guest cart lines into the authenticated shopper cart.
    /// </summary>
    private static async Task<IResult> MergeGuestCart(
        HttpRequest request,
        IShopperSessionPort sessions,
        ICouponValidationPort coupons,
        CartDbContext db,
        CancellationToken ct)
    {
        var user = await CartAuth.RequireUser(request, sessions, ct);
        if (user is null || !Guid.TryParse(user.Id, out var userId))
        {
            return Results.Unauthorized();
        }

        var guestToken = CartAuth.ReadGuestToken(request);
        if (string.IsNullOrWhiteSpace(guestToken))
        {
            var cartOnly = await GetOrCreateCartAsync(db, userId, ct);
            return Results.Ok(await ToCartDto(db, coupons, cartOnly, ct));
        }

        var guestUserId = MixPlus.BuildingBlocks.Domain.StableGuid.From("guest-cart:" + guestToken);
        if (guestUserId == userId)
        {
            var same = await GetOrCreateCartAsync(db, userId, ct);
            return Results.Ok(await ToCartDto(db, coupons, same, ct));
        }

        var userCart = await GetOrCreateCartAsync(db, userId, ct);
        var guestCart = await db.Carts
            .Include("_lines")
            .FirstOrDefaultAsync(x => x.UserId == guestUserId, ct);

        if (guestCart is null || guestCart.Lines.Count == 0)
        {
            return Results.Ok(await ToCartDto(db, coupons, userCart, ct));
        }

        foreach (var guestLine in guestCart.Lines.ToList())
        {
            var existing = userCart.Lines.FirstOrDefault(x =>
                x.ProductSlug == guestLine.ProductSlug
                && x.OfferExternalKey == guestLine.OfferExternalKey
                && x.SkuExternalKey == guestLine.SkuExternalKey);

            if (existing is not null)
            {
                existing.SetQuantity(existing.Quantity + guestLine.Quantity);
                db.CartLines.Remove(guestLine);
            }
            else
            {
                guestCart.RemoveLine(guestLine.Id);
                var moved = CartLine.Create(
                    userCart.Id,
                    guestLine.ProductSlug,
                    guestLine.OfferExternalKey,
                    guestLine.SkuExternalKey,
                    guestLine.SellerExternalKey,
                    guestLine.SellerName,
                    guestLine.Title,
                    guestLine.ImageUrl,
                    guestLine.VariantLabel,
                    guestLine.UnitPrice,
                    guestLine.OriginalPrice,
                    guestLine.DiscountPercent,
                    guestLine.Currency,
                    guestLine.Quantity,
                    guestLine.StockAvailable);
                userCart.AddOrIncrement(moved);
                db.CartLines.Add(moved);
                db.CartLines.Remove(guestLine);
            }
        }

        if (string.IsNullOrWhiteSpace(userCart.CouponCode) && !string.IsNullOrWhiteSpace(guestCart.CouponCode))
        {
            userCart.SetCoupon(guestCart.CouponCode);
        }

        if (string.IsNullOrWhiteSpace(userCart.GiftCardCode) && !string.IsNullOrWhiteSpace(guestCart.GiftCardCode))
        {
            userCart.SetGiftCard(guestCart.GiftCardCode);
        }

        db.Carts.Remove(guestCart);
        userCart.Touch();
        await db.SaveChangesAsync(ct);
        return Results.Ok(await ToCartDto(db, coupons, userCart, ct));
    }

    internal static async Task<ShoppingCart> GetOrCreateCartAsync(
        CartDbContext db,
        Guid userId,
        CancellationToken ct)
    {
        var cart = await db.Carts
            .Include("_lines")
            .FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (cart is not null) return cart;

        cart = ShoppingCart.Create(userId);
        db.Carts.Add(cart);
        await db.SaveChangesAsync(ct);
        return cart;
    }

    internal static async Task<WalletAccount> EnsureWalletAsync(
        CartDbContext db,
        Guid userId,
        CancellationToken ct)
    {
        var wallet = await db.Wallets.FirstOrDefaultAsync(x => x.UserId == userId, ct);
        if (wallet is not null) return wallet;
        wallet = WalletAccount.Create(userId, openingBalance: 1_000_000m);
        db.Wallets.Add(wallet);
        await db.SaveChangesAsync(ct);
        return wallet;
    }

    private static async Task<ProductCardModel?> TryLiveSnapshot(
        IProductCardReadPort catalog,
        string productSlug,
        CancellationToken ct)
    {
        // Cards are keyed by external key; slug search as fallback.
        var bySearch = await catalog.SearchProductsAsync(productSlug, 5, ct);
        return bySearch.FirstOrDefault(x =>
            string.Equals(x.Slug, productSlug, StringComparison.OrdinalIgnoreCase));
    }

    internal static async Task<object> ToCartDto(
        CartDbContext db,
        ICouponValidationPort coupons,
        ShoppingCart cart,
        CancellationToken ct)
    {
        var lines = cart.Lines.Select(MapLine).ToList();
        var subtotal = lines.Sum(x => x.UnitPrice * x.Quantity);
        var currency = lines.FirstOrDefault()?.Currency ?? "IRT";

        decimal couponDiscount = 0;
        string? couponLabel = null;
        if (!string.IsNullOrWhiteSpace(cart.CouponCode))
        {
            var quote = await coupons.ValidateAsync(cart.CouponCode, subtotal, ct);
            if (quote.IsValid)
            {
                couponDiscount = quote.DiscountAmount;
                couponLabel = quote.DiscountLabel;
            }
        }

        decimal giftBalance = 0;
        if (!string.IsNullOrWhiteSpace(cart.GiftCardCode))
        {
            var card = await db.GiftCards.AsNoTracking()
                .FirstOrDefaultAsync(x => x.Code == cart.GiftCardCode, ct);
            if (card is not null
                && card.Status == "active"
                && card.Balance > 0
                && card.ExpiresAtUtc > DateTime.UtcNow)
            {
                giftBalance = card.Balance;
            }
        }

        var afterCoupon = Math.Max(0, subtotal - couponDiscount);
        var giftApplied = Math.Min(giftBalance, afterCoupon);
        var afterGift = Math.Max(0, afterCoupon - giftApplied);
        var walletApplied = Math.Min(cart.WalletAmountApplied, afterGift);
        var payable = Math.Max(0, afterGift - walletApplied);

        var wallet = await db.Wallets.AsNoTracking()
            .FirstOrDefaultAsync(x => x.UserId == cart.UserId, ct);

        return new
        {
            id = cart.Id.ToString("D"),
            updatedAt = cart.UpdatedAtUtc,
            items = lines.Select(x => new
            {
                id = x.Id,
                productSlug = x.ProductSlug,
                offerExternalKey = x.OfferExternalKey,
                skuExternalKey = x.SkuExternalKey,
                sellerExternalKey = x.SellerExternalKey,
                sellerName = x.SellerName,
                title = x.Title,
                imageUrl = x.ImageUrl,
                variantLabel = x.VariantLabel,
                unitPrice = x.UnitPrice,
                originalPrice = x.OriginalPrice,
                discountPercent = x.DiscountPercent,
                currency = x.Currency,
                quantity = x.Quantity,
                stockAvailable = x.StockAvailable,
                inStock = x.InStock,
                lineTotal = x.UnitPrice * x.Quantity,
            }),
            itemCount = lines.Sum(x => x.Quantity),
            currency,
            subtotal,
            couponCode = cart.CouponCode,
            couponLabel,
            couponDiscount,
            giftCardCode = cart.GiftCardCode,
            giftCardBalance = giftBalance,
            giftCardApplied = giftApplied,
            walletBalance = wallet?.Balance ?? 0m,
            walletApplied = walletApplied,
            payableBeforeShipping = payable,
            hasStockIssues = lines.Any(x => !x.InStock || x.Quantity > x.StockAvailable),
        };
    }

    private static CartLineDto MapLine(CartLine x) => new(
        x.Id.ToString("D"),
        x.ProductSlug,
        x.OfferExternalKey,
        x.SkuExternalKey,
        x.SellerExternalKey,
        x.SellerName,
        x.Title,
        x.ImageUrl,
        x.VariantLabel,
        x.UnitPrice,
        x.OriginalPrice,
        x.DiscountPercent,
        x.Currency,
        x.Quantity,
        x.StockAvailable,
        x.InStock);

    private sealed record CartLineDto(
        string Id,
        string ProductSlug,
        string OfferExternalKey,
        string SkuExternalKey,
        string SellerExternalKey,
        string SellerName,
        string Title,
        string ImageUrl,
        string? VariantLabel,
        decimal UnitPrice,
        decimal? OriginalPrice,
        int? DiscountPercent,
        string Currency,
        int Quantity,
        int StockAvailable,
        bool InStock);

    private sealed record AddCartItemRequest(
        string ProductSlug,
        string OfferExternalKey,
        string? SkuExternalKey,
        string? SellerExternalKey,
        string? SellerName,
        string? Title,
        string? ImageUrl,
        string? VariantLabel,
        decimal UnitPrice,
        decimal? OriginalPrice,
        int? DiscountPercent,
        string? Currency,
        int Quantity,
        int? StockAvailable);

    private sealed record UpdateCartItemRequest(int Quantity);

    private sealed record CodeRequest(string? Code);

    private sealed record WalletRequest(decimal Amount);
}
