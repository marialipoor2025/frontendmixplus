using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using MixPlus.BuildingBlocks.Application;
using MixPlus.BuildingBlocks.Application.Contracts;
using MixPlus.BuildingBlocks.Domain;
using MixPlus.Modules.Catalog.Application.Products;
using MixPlus.Modules.Catalog.Application.Specs;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Domain.Specs;
using MixPlus.Modules.Catalog.Domain.Variants;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

namespace MixPlus.Modules.Catalog.Api;

/// <summary>
/// Seller portal catalog APIs — products owned by the authenticated seller (Guid ownership via port).
/// Wizard steps map 1:1 to PDP sections.
/// </summary>
internal static class SellerCatalogEndpoints
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
    };

    public static void MapSellerCatalogEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/seller").WithTags("SellerCatalog");

        group.MapGet("/products", ListProducts).WithName("SellerListProducts");
        group.MapPost("/products", CreateProduct).WithName("SellerCreateProduct");
        group.MapGet("/products/{id}", GetProduct).WithName("SellerGetProduct");
        group.MapGet("/products/{id}/wizard", GetWizard).WithName("SellerGetProductWizard");
        group.MapPut("/products/{id}/basics", UpdateBasics).WithName("SellerUpdateProductBasics");
        group.MapPut("/products/{id}/pricing", UpdatePricing).WithName("SellerUpdateProductPricing");
        group.MapPut("/products/{id}/media", ReplaceProductMedia).WithName("SellerReplaceProductMedia");
        group.MapPut("/products/{id}/specs", ReplaceSpecs).WithName("SellerReplaceProductSpecs");
        group.MapPut("/products/{id}/content", UpdateContent).WithName("SellerUpdateProductContent");
        group.MapPut("/products/{id}/variants", UpdateVariants).WithName("SellerUpdateProductVariants");
        group.MapPut("/products/{id}/publish", PublishProduct).WithName("SellerPublishProduct");
    }

    private static async Task<IResult> ListProducts(
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        string? q,
        bool? isPublished,
        bool? inStock,
        string? sortBy = "title",
        string? sortDir = "asc",
        int page = 1,
        int pageSize = 10,
        CancellationToken ct = default)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = db.Products.AsNoTracking()
            .Where(x => x.SellerId == seller!.Id);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(x =>
                x.Title.Contains(term) ||
                x.Slug.Contains(term) ||
                x.ExternalKey.Contains(term) ||
                x.BrandName.Contains(term));
        }

        if (isPublished is not null)
        {
            query = query.Where(x => x.IsPublished == isPublished);
        }

        if (inStock is not null)
        {
            query = query.Where(x => x.InStock == inStock);
        }

        var descending = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);
        query = (sortBy?.Trim().ToLowerInvariant()) switch
        {
            "slug" => descending ? query.OrderByDescending(x => x.Slug) : query.OrderBy(x => x.Slug),
            "price" => descending
                ? query.OrderByDescending(x => x.Price.Amount)
                : query.OrderBy(x => x.Price.Amount),
            "stock" or "instock" => descending
                ? query.OrderByDescending(x => x.InStock)
                : query.OrderBy(x => x.InStock),
            "status" or "ispublished" => descending
                ? query.OrderByDescending(x => x.IsPublished)
                : query.OrderBy(x => x.IsPublished),
            "media" or "mediacount" => descending
                ? query.OrderByDescending(x => x.MediaItems.Count)
                : query.OrderBy(x => x.MediaItems.Count),
            _ => descending
                ? query.OrderByDescending(x => x.Title)
                : query.OrderBy(x => x.Title),
        };

        var totalCount = await query.CountAsync(ct);
        var rows = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new SellerProductListItemDto(
                x.ExternalKey,
                x.Title,
                x.Slug,
                x.ImageUrl,
                x.BrandName,
                x.IsPublished,
                x.InStock,
                x.MediaItems.Count,
                new MoneyDto(x.Price.Amount, x.Price.Currency)))
            .ToListAsync(ct);

        return Results.Ok(PagedResult<SellerProductListItemDto>.Create(rows, page, pageSize, totalCount));
    }

    private static async Task<IResult> CreateProduct(
        CreateSellerProductRequest body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        if (string.IsNullOrWhiteSpace(body.Title) || string.IsNullOrWhiteSpace(body.Slug))
        {
            return Results.BadRequest(new { error = "عنوان و اسلاگ الزامی است" });
        }

        if (string.IsNullOrWhiteSpace(body.BrandId) || string.IsNullOrWhiteSpace(body.BrandName))
        {
            return Results.BadRequest(new { error = "برند الزامی است" });
        }

        var externalKey = $"sp-{Guid.NewGuid():N}"[..14];
        var slug = body.Slug.Trim().ToLowerInvariant();

        if (await db.Products.AnyAsync(x => x.Slug == slug, ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        var priceAmount = body.Price?.Amount ?? 0;
        var product = Product.Create(
            externalKey,
            body.Title,
            slug,
            "/placeholders/product-appliance.png",
            body.BrandId.Trim(),
            body.BrandName.Trim(),
            seller!.ExternalKey,
            seller.Name,
            Money.Create(priceAmount, body.Price?.Currency ?? "IRR"),
            body.InStock,
            isPublished: false);

        product.ApplyDetails(
            null,
            null,
            null,
            null,
            null,
            null,
            ParseCondition(body.Condition),
            body.InStock);

        await ApplyCategoryAsync(product, body.CategoryId, body.CategoryName, db, ct);
        db.Products.Add(product);
        await db.SaveChangesAsync(ct);

        return Results.Created(
            $"/api/seller/products/{product.ExternalKey}/wizard",
            await BuildWizardDtoAsync(db, product, ct));
    }

    private static async Task<IResult> GetProduct(
        string id,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: false);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        return Results.Ok(ToSellerProductDto(product));
    }

    private static async Task<IResult> GetWizard(
        string id,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: false);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        return Results.Ok(await BuildWizardDtoAsync(db, product, ct));
    }

    private static async Task<IResult> UpdateBasics(
        string id,
        UpdateSellerBasicsRequest body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        if (string.IsNullOrWhiteSpace(body.Title) || string.IsNullOrWhiteSpace(body.Slug))
        {
            return Results.BadRequest(new { error = "عنوان و اسلاگ الزامی است" });
        }

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: true);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var slug = body.Slug.Trim().ToLowerInvariant();
        if (await db.Products.AnyAsync(x => x.Slug == slug && x.ExternalKey != id, ct))
        {
            return Results.Conflict(new { error = "اسلاگ تکراری است" });
        }

        product.UpdateSellerBasics(
            body.Title,
            slug,
            body.BrandId,
            body.BrandName,
            ParseCondition(body.Condition),
            body.InStock);
        product.SetPublished(body.IsPublished);
        await ApplyCategoryAsync(product, body.CategoryId, body.CategoryName, db, ct);
        await db.SaveChangesAsync(ct);

        return Results.Ok(await BuildWizardDtoAsync(db, product, ct));
    }

    private static async Task<IResult> UpdatePricing(
        string id,
        UpdateSellerPricingRequest body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        if (body.Price is null || body.Price.Amount <= 0)
        {
            return Results.BadRequest(new { error = "قیمت فروش نامعتبر است" });
        }

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: true);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var salePrice = Money.Create(body.Price.Amount, body.Price.Currency);
        var listPrice = body.OriginalPrice is null
            ? null
            : Money.Create(body.OriginalPrice.Amount, body.OriginalPrice.Currency);

        product.ApplyPricing(salePrice, listPrice, body.DiscountPercent, body.InStock);
        await SyncSkuPricingAsync(db, product.Id, salePrice, listPrice, body.DiscountPercent, ct);

        var content = ReadContent(product) ?? new SellerPdpContent();
        content.ShowWarranty = body.ShowWarranty ?? true;
        content.Warranty = body.Warranty;
        content.ShowDelivery = body.ShowDelivery ?? true;
        content.DeliveryTitle = body.DeliveryTitle;
        content.DeliveryMethodLabel = body.DeliveryMethodLabel;
        content.DeliveryCostLabel = body.DeliveryCostLabel;
        content.ShowPricePolicy = body.ShowPricePolicy ?? true;
        content.PricePolicyLabel = body.PricePolicyLabel;
        content.ShowInsurance = body.ShowInsurance ?? false;
        content.InsuranceTitle = body.InsuranceTitle;
        content.InsurancePrice = body.InsurancePrice;
        content.InsuranceOriginalPrice = body.InsuranceOriginalPrice;
        content.InsuranceDiscountPercent = body.InsuranceDiscountPercent;
        product.ReplacePdpContent(JsonSerializer.Serialize(content, JsonOptions));

        await db.SaveChangesAsync(ct);
        return Results.Ok(await BuildWizardDtoAsync(db, product, ct));
    }

    private static async Task<IResult> ReplaceProductMedia(
        string id,
        ReplaceSellerProductMediaRequest body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        if (body.MediaIds is null)
        {
            return Results.BadRequest(new { error = "لیست رسانه الزامی است" });
        }

        foreach (var mediaId in body.MediaIds)
        {
            if (!Guid.TryParse(mediaId, out _))
            {
                return Results.BadRequest(new { error = $"شناسه رسانه نامعتبر: {mediaId}" });
            }
        }

        // Load without MediaItems — OwnsMany ReplaceMedia+SaveChanges emits UPDATE and 500s.
        var product = await db.Products
            .FirstOrDefaultAsync(x => x.ExternalKey == id && x.SellerId == seller!.Id, ct);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var mediaAssetIds = body.MediaIds
            .Where(mid => Guid.TryParse(mid, out _))
            .Select(Guid.Parse)
            .ToList();

        var imageUrl = mediaAssetIds.Count > 0
            ? ProductMediaUrls.Gallery(mediaAssetIds[0])
            : product.ImageUrl;

        var productId = product.Id;
        await db.Database.ExecuteSqlInterpolatedAsync(
            $"""DELETE FROM catalog."ProductMedia" WHERE "ProductId" = {productId}""",
            ct);

        for (var i = 0; i < mediaAssetIds.Count; i++)
        {
            var rowId = Guid.NewGuid();
            var assetId = mediaAssetIds[i];
            var isPrimary = i == 0;
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"""
                INSERT INTO catalog."ProductMedia" ("Id", "ProductId", "MediaAssetId", "SortOrder", "IsPrimary")
                VALUES ({rowId}, {productId}, {assetId}, {i}, {isPrimary})
                """,
                ct);
        }

        product.UpdateCore(
            product.Title,
            product.Slug,
            imageUrl,
            product.BrandExternalKey,
            product.BrandName,
            product.SellerExternalKey,
            product.SellerName,
            product.Price);
        await db.SaveChangesAsync(ct);

        var reloaded = await FindOwnedAsync(db, id, seller.Id, ct, tracking: false);
        return Results.Ok(ToSellerProductDto(reloaded!));
    }

    private static async Task<IResult> ReplaceSpecs(
        string id,
        UpsertProductSpecsRequest body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: false);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var existing = await db.SpecGroups.Where(x => x.ProductId == product.Id).ToListAsync(ct);
        db.SpecGroups.RemoveRange(existing);

        var sort = 0;
        foreach (var groupReq in body.Groups ?? [])
        {
            if (string.IsNullOrWhiteSpace(groupReq.Title)) continue;

            var attrs = new List<ProductSpecAttribute>();
            var attrSort = 0;
            foreach (var attrReq in groupReq.Attributes ?? [])
            {
                if (string.IsNullOrWhiteSpace(attrReq.Label) || attrReq.Values is null || attrReq.Values.Count == 0)
                {
                    continue;
                }

                attrs.Add(ProductSpecAttribute.Create(attrReq.Label, attrReq.Values, attrSort++));
            }

            if (attrs.Count == 0) continue;

            db.SpecGroups.Add(ProductSpecGroup.Create(
                product.Id,
                product.ExternalKey,
                groupReq.Title,
                sort++,
                groupReq.PreviewCount,
                attrs));
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(await BuildWizardDtoAsync(db, product, ct));
    }

    private static async Task<IResult> UpdateContent(
        string id,
        UpdateSellerContentRequest body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: true);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        var content = ReadContent(product) ?? new SellerPdpContent();
        content.IntroPreview = body.IntroPreview;
        content.IntroFull = body.IntroFull;
        content.ExpertReviewTitle = body.ExpertReviewTitle;
        content.ExpertReviewPreview = body.ExpertReviewPreview;
        content.ExpertReviewFull = body.ExpertReviewFull;
        content.Features = body.Features?
            .Select(f => new SellerFeatureDto(f.Id, f.Label, f.Value))
            .ToList();

        product.ReplacePdpContent(JsonSerializer.Serialize(content, JsonOptions));
        await db.SaveChangesAsync(ct);
        return Results.Ok(await BuildWizardDtoAsync(db, product, ct));
    }

    private static async Task<IResult> UpdateVariants(
        string id,
        JsonElement body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: true);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        SellerVariantsPayload? payload = null;
        try
        {
            payload = JsonSerializer.Deserialize<SellerVariantsPayload>(body.GetRawText(), JsonOptions);
        }
        catch
        {
            return Results.BadRequest(new { error = "فرمت تنوع‌ها نامعتبر است" });
        }

        // Keep JSON for wizard round-trip, and write shopper OptionGroups/SKUs.
        var content = ReadContent(product) ?? new SellerPdpContent();
        content.Variants = body;
        product.ReplacePdpContent(JsonSerializer.Serialize(content, JsonOptions));

        var existingGroups = await db.OptionGroups.Where(x => x.ProductId == product.Id).ToListAsync(ct);
        db.OptionGroups.RemoveRange(existingGroups);
        var existingSkus = await db.Skus.Where(x => x.ProductId == product.Id).ToListAsync(ct);
        db.Skus.RemoveRange(existingSkus);

        var idMap = new Dictionary<string, Guid>(StringComparer.OrdinalIgnoreCase);
        var sort = 0;
        foreach (var group in payload?.OptionGroups ?? [])
        {
            if (string.IsNullOrWhiteSpace(group.Name) || group.Values is null || group.Values.Count == 0)
            {
                continue;
            }

            sort++;
            var values = new List<ProductOptionValue>();
            var valueSort = 0;
            foreach (var value in group.Values)
            {
                if (string.IsNullOrWhiteSpace(value.Label)) continue;
                valueSort++;
                var valueId = Guid.TryParse(value.Id, out var parsedValue) ? parsedValue : Guid.NewGuid();
                if (!string.IsNullOrWhiteSpace(value.Id))
                {
                    idMap[value.Id] = valueId;
                }

                values.Add(ProductOptionValue.Create(
                    value.Label,
                    value.SwatchHex,
                    value.Available ?? true,
                    valueSort,
                    valueId));
            }

            if (values.Count == 0) continue;

            db.OptionGroups.Add(ProductOptionGroup.Create(
                product.Id,
                product.ExternalKey,
                string.IsNullOrWhiteSpace(group.Code) ? $"opt-{sort}" : group.Code,
                group.Name,
                string.IsNullOrWhiteSpace(group.Ui) ? "chip" : group.Ui,
                sort,
                values));
        }

        foreach (var sku in payload?.Skus ?? [])
        {
            if (string.IsNullOrWhiteSpace(sku.Sku)) continue;
            var optionIds = (sku.OptionValueIds ?? [])
                .Select(raw =>
                {
                    if (Guid.TryParse(raw, out var g)) return g;
                    return idMap.TryGetValue(raw, out var mapped) ? mapped : Guid.Empty;
                })
                .Where(x => x != Guid.Empty)
                .ToList();

            db.Skus.Add(ProductSku.Create(
                product.Id,
                product.ExternalKey,
                sku.Sku,
                optionIds,
                Money.Create(sku.Price <= 0 ? product.Price.Amount : sku.Price, product.Price.Currency),
                sku.Stock ?? 10,
                sku.OriginalPrice is null or <= 0
                    ? null
                    : Money.Create(sku.OriginalPrice.Value, product.Price.Currency),
                sku.DiscountPercent));
        }

        await db.SaveChangesAsync(ct);
        return Results.Ok(await BuildWizardDtoAsync(db, product, ct));
    }

    private static async Task<IResult> PublishProduct(
        string id,
        PublishSellerProductRequest body,
        HttpRequest request,
        CatalogDbContext db,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var (seller, error) = await ResolveSellerAsync(request, users, sellers, ct);
        if (error is not null) return error;

        var product = await FindOwnedAsync(db, id, seller!.Id, ct, tracking: true);
        if (product is null) return Results.NotFound(new { error = "محصول یافت نشد" });

        if (body.IsPublished && string.IsNullOrWhiteSpace(product.Title))
        {
            return Results.BadRequest(new { error = "عنوان محصول برای انتشار الزامی است" });
        }

        // Re-sync SKU money from product so published PDP (SKU-driven buy box) matches.
        await SyncSkuPricingAsync(
            db,
            product.Id,
            product.Price,
            product.OriginalPrice,
            product.DiscountPercent,
            ct);

        product.SetPublished(body.IsPublished);
        await db.SaveChangesAsync(ct);
        return Results.Ok(await BuildWizardDtoAsync(db, product, ct));
    }

    /// <summary>
    /// Product-level buy-box price is authoritative for seller wizard; keep SKUs aligned.
    /// </summary>
    private static async Task SyncSkuPricingAsync(
        CatalogDbContext db,
        Guid productId,
        Money salePrice,
        Money? listPrice,
        int? discountPercent,
        CancellationToken ct)
    {
        var skus = await db.Skus.Where(x => x.ProductId == productId).ToListAsync(ct);
        foreach (var sku in skus)
        {
            sku.ApplyPricing(salePrice, listPrice, discountPercent);
            // Owned Money replacements are not always auto-detected; force write.
            db.Entry(sku).State = EntityState.Modified;
        }
    }

    private static async Task<Product?> FindOwnedAsync(
        CatalogDbContext db,
        string id,
        Guid sellerId,
        CancellationToken ct,
        bool tracking)
    {
        var query = tracking ? db.Products.AsQueryable() : db.Products.AsNoTracking();
        return await query
            .Include(x => x.MediaItems)
            .FirstOrDefaultAsync(x => x.ExternalKey == id && x.SellerId == sellerId, ct);
    }

    private static async Task<(SellerAccountModel? Seller, IResult? Error)> ResolveSellerAsync(
        HttpRequest request,
        ICurrentUserAccessor users,
        ISellerAccountReadPort sellers,
        CancellationToken ct)
    {
        var userId = await users.GetUserIdAsync(ReadBearer(request), ct);
        if (userId is null)
        {
            return (null, Results.Unauthorized());
        }

        var seller = await sellers.GetByOwnerUserIdAsync(userId.Value, ct);
        if (seller is null)
        {
            return (null, Results.Json(
                new { error = "حساب فروشنده برای این کاربر یافت نشد" },
                statusCode: StatusCodes.Status403Forbidden));
        }

        return (seller, null);
    }

    private static string? ReadBearer(HttpRequest request)
    {
        var header = request.Headers.Authorization.ToString();
        if (string.IsNullOrWhiteSpace(header))
        {
            return null;
        }

        const string prefix = "Bearer ";
        return header.StartsWith(prefix, StringComparison.OrdinalIgnoreCase)
            ? header[prefix.Length..].Trim()
            : header.Trim();
    }

    private static async Task ApplyCategoryAsync(
        Product product,
        string? categoryExternalKey,
        string? categoryName,
        CatalogDbContext db,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(categoryExternalKey))
        {
            if (!string.IsNullOrWhiteSpace(categoryName))
            {
                var key = $"c-{StableGuid.From(categoryName.Trim()):N}"[..12];
                product.SetCategory(StableGuid.From(key), key, categoryName.Trim());
                return;
            }

            product.SetCategory(null, null, null);
            return;
        }

        var category = await db.Categories.AsNoTracking()
            .FirstOrDefaultAsync(x => x.ExternalKey == categoryExternalKey.Trim(), ct);
        if (category is null)
        {
            product.SetCategory(
                StableGuid.From(categoryExternalKey.Trim()),
                categoryExternalKey.Trim(),
                categoryName);
            return;
        }

        product.SetCategory(category.Id, category.ExternalKey, category.Title);
    }

    private static ProductCondition ParseCondition(string? condition) =>
        string.Equals(condition, "used", StringComparison.OrdinalIgnoreCase)
            ? ProductCondition.Used
            : ProductCondition.New;

    private static SellerPdpContent? ReadContent(Product product)
    {
        if (string.IsNullOrWhiteSpace(product.PdpContentJson)) return null;
        try
        {
            return JsonSerializer.Deserialize<SellerPdpContent>(product.PdpContentJson, JsonOptions);
        }
        catch
        {
            return null;
        }
    }

    private static async Task<SellerWizardProductDto> BuildWizardDtoAsync(
        CatalogDbContext db,
        Product product,
        CancellationToken ct)
    {
        var gallery = product.MediaItems
            .OrderBy(x => x.SortOrder)
            .Select(x => new ProductMediaDto(
                x.MediaAssetId.ToString("D"),
                ProductMediaUrls.Gallery(x.MediaAssetId),
                ProductMediaUrls.Thumb(x.MediaAssetId),
                product.Title,
                x.IsPrimary))
            .ToList();

        var specGroups = await db.SpecGroups.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);

        var specs = specGroups.Select(g => new ProductSpecGroupDto(
            g.Id.ToString("D"),
            g.Title,
            g.PreviewCount,
            g.Attributes.OrderBy(a => a.SortOrder)
                .Select(a => new ProductSpecAttributeDto(
                    a.Id.ToString("D"),
                    a.Label,
                    a.GetValues()))
                .ToList())).ToList();

        var content = ReadContent(product);

        JsonElement? variantsJson = content?.Variants;
        var optionGroups = await db.OptionGroups.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SortOrder)
            .ToListAsync(ct);
        var skus = await db.Skus.AsNoTracking()
            .Where(x => x.ProductId == product.Id)
            .OrderBy(x => x.SkuCode)
            .ToListAsync(ct);

        if (optionGroups.Count > 0 || skus.Count > 0)
        {
            variantsJson = JsonSerializer.SerializeToElement(new
            {
                optionGroups = optionGroups.Select(g => new
                {
                    id = g.Id.ToString("D"),
                    code = g.Code,
                    name = g.Name,
                    ui = g.Ui,
                    values = g.Values.OrderBy(v => v.SortOrder).Select(v => new
                    {
                        id = v.Id.ToString("D"),
                        label = v.Label,
                        swatchHex = v.SwatchHex,
                        available = v.Available,
                    }),
                }),
                skus = skus.Select(s => new
                {
                    id = s.Id.ToString("D"),
                    sku = s.SkuCode,
                    optionValueIds = s.GetOptionValueIds().Select(x => x.ToString("D")),
                    price = s.Price.Amount,
                    originalPrice = s.OriginalPrice?.Amount,
                    discountPercent = s.DiscountPercent,
                    inStock = s.InStock,
                    stock = s.Stock,
                }),
            }, JsonOptions);
        }

        return new SellerWizardProductDto(
            product.ExternalKey,
            product.Title,
            product.Slug,
            product.ImageUrl,
            product.BrandExternalKey,
            product.BrandName,
            product.CategoryExternalKey,
            product.CategoryName,
            product.Condition == ProductCondition.Used ? "used" : "new",
            product.InStock,
            product.IsPublished,
            new MoneyDto(product.Price.Amount, product.Price.Currency),
            product.OriginalPrice is null
                ? null
                : new MoneyDto(product.OriginalPrice.Amount, product.OriginalPrice.Currency),
            product.DiscountPercent,
            content?.ShowWarranty ?? true,
            content?.Warranty,
            content?.ShowDelivery ?? true,
            content?.DeliveryTitle,
            content?.DeliveryMethodLabel,
            content?.DeliveryCostLabel,
            content?.ShowPricePolicy ?? true,
            content?.PricePolicyLabel,
            content?.ShowInsurance ?? false,
            content?.InsuranceTitle,
            content?.InsurancePrice,
            content?.InsuranceOriginalPrice,
            content?.InsuranceDiscountPercent,
            gallery,
            specs,
            content?.IntroPreview,
            content?.IntroFull,
            content?.ExpertReviewTitle,
            content?.ExpertReviewPreview,
            content?.ExpertReviewFull,
            content?.Features,
            variantsJson);
    }

    private static SellerProductDto ToSellerProductDto(Product product)
    {
        var gallery = product.MediaItems
            .OrderBy(x => x.SortOrder)
            .Select(x => new ProductMediaDto(
                x.MediaAssetId.ToString("D"),
                ProductMediaUrls.Gallery(x.MediaAssetId),
                ProductMediaUrls.Thumb(x.MediaAssetId),
                product.Title,
                x.IsPrimary))
            .ToList();

        return new SellerProductDto(
            product.ExternalKey,
            product.Title,
            product.Slug,
            product.ImageUrl,
            product.IsPublished,
            product.InStock,
            gallery);
    }

    private sealed record SellerProductListItemDto(
        string Id,
        string Title,
        string Slug,
        string ImageUrl,
        string BrandName,
        bool IsPublished,
        bool InStock,
        int MediaCount,
        MoneyDto Price);

    private sealed record SellerProductDto(
        string Id,
        string Title,
        string Slug,
        string ImageUrl,
        bool IsPublished,
        bool InStock,
        IReadOnlyList<ProductMediaDto> Gallery);

    private sealed record SellerWizardProductDto(
        string Id,
        string Title,
        string Slug,
        string ImageUrl,
        string BrandId,
        string BrandName,
        string? CategoryId,
        string? CategoryName,
        string? Condition,
        bool InStock,
        bool IsPublished,
        MoneyDto Price,
        MoneyDto? OriginalPrice,
        int? DiscountPercent,
        bool ShowWarranty,
        string? Warranty,
        bool ShowDelivery,
        string? DeliveryTitle,
        string? DeliveryMethodLabel,
        string? DeliveryCostLabel,
        bool ShowPricePolicy,
        string? PricePolicyLabel,
        bool ShowInsurance,
        string? InsuranceTitle,
        decimal? InsurancePrice,
        decimal? InsuranceOriginalPrice,
        int? InsuranceDiscountPercent,
        IReadOnlyList<ProductMediaDto> Gallery,
        IReadOnlyList<ProductSpecGroupDto> Specs,
        string? IntroPreview,
        string? IntroFull,
        string? ExpertReviewTitle,
        string? ExpertReviewPreview,
        string? ExpertReviewFull,
        IReadOnlyList<SellerFeatureDto>? Features,
        JsonElement? Variants);

    private sealed class SellerPdpContent
    {
        public string? IntroPreview { get; set; }
        public string? IntroFull { get; set; }
        public string? ExpertReviewTitle { get; set; }
        public string? ExpertReviewPreview { get; set; }
        public string? ExpertReviewFull { get; set; }
        public List<SellerFeatureDto>? Features { get; set; }
        public bool? ShowWarranty { get; set; }
        public string? Warranty { get; set; }
        public bool? ShowDelivery { get; set; }
        public string? DeliveryTitle { get; set; }
        public string? DeliveryMethodLabel { get; set; }
        public string? DeliveryCostLabel { get; set; }
        public bool? ShowPricePolicy { get; set; }
        public string? PricePolicyLabel { get; set; }
        public bool? ShowInsurance { get; set; }
        public string? InsuranceTitle { get; set; }
        public decimal? InsurancePrice { get; set; }
        public decimal? InsuranceOriginalPrice { get; set; }
        public int? InsuranceDiscountPercent { get; set; }
        public JsonElement? Variants { get; set; }
    }

    private sealed record SellerFeatureDto(string Id, string Label, string Value);

    private sealed class SellerVariantsPayload
    {
        public List<SellerOptionGroupPayload>? OptionGroups { get; set; }
        public List<SellerSkuPayload>? Skus { get; set; }
    }

    private sealed class SellerOptionGroupPayload
    {
        public string? Id { get; set; }
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? Ui { get; set; }
        public List<SellerOptionValuePayload>? Values { get; set; }
    }

    private sealed class SellerOptionValuePayload
    {
        public string? Id { get; set; }
        public string? Label { get; set; }
        public string? SwatchHex { get; set; }
        public bool? Available { get; set; }
    }

    private sealed class SellerSkuPayload
    {
        public string? Id { get; set; }
        public string? Sku { get; set; }
        public List<string>? OptionValueIds { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public int? DiscountPercent { get; set; }
        public int? Stock { get; set; }
    }

    private sealed record CreateSellerProductRequest(
        string Title,
        string Slug,
        string BrandId,
        string BrandName,
        string? CategoryId,
        string? CategoryName,
        string? Condition,
        bool InStock,
        bool IsPublished,
        MoneyDto? Price,
        string? SellerId,
        string? SellerName);

    private sealed record UpdateSellerBasicsRequest(
        string Title,
        string Slug,
        string BrandId,
        string BrandName,
        string? CategoryId,
        string? CategoryName,
        string? Condition,
        bool InStock,
        bool IsPublished);

    private sealed record UpdateSellerPricingRequest(
        MoneyDto Price,
        MoneyDto? OriginalPrice,
        int? DiscountPercent,
        bool? ShowWarranty,
        string? Warranty,
        bool? ShowDelivery,
        string? DeliveryTitle,
        string? DeliveryMethodLabel,
        string? DeliveryCostLabel,
        bool? ShowPricePolicy,
        string? PricePolicyLabel,
        bool? ShowInsurance,
        string? InsuranceTitle,
        decimal? InsurancePrice,
        decimal? InsuranceOriginalPrice,
        int? InsuranceDiscountPercent,
        bool InStock);

    private sealed record UpdateSellerContentRequest(
        string? IntroPreview,
        string? IntroFull,
        string? ExpertReviewTitle,
        string? ExpertReviewPreview,
        string? ExpertReviewFull,
        IReadOnlyList<SellerFeatureDto>? Features);

    private sealed record PublishSellerProductRequest(bool IsPublished);

    private sealed record ReplaceSellerProductMediaRequest(IReadOnlyList<string>? MediaIds);
}
