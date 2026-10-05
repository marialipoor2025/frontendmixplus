using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace MixPlus.Modules.Identity.Api;

internal static class AdminRoleEndpoints
{
    public static void MapAdminRoleEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/admin/roles").WithTags("AdminRoles");
        group.MapGet("/", ListRoles).WithName("AdminListRoles");
    }

    private static IResult ListRoles()
    {
        string[] all =
        [
            "dashboard:view",
            "products:manage",
            "variants:manage",
            "specs:manage",
            "categories:manage",
            "brands:manage",
            "media:manage",
            "inventory:manage",
            "sellers:manage",
            "offers:manage",
            "orders:manage",
            "customers:manage",
            "promotions:manage",
            "coupons:manage",
            "cms:manage",
            "reviews:moderate",
            "reports:view",
            "audit:view",
            "roles:manage",
        ];

        var roles = new[]
        {
            new
            {
                id = "super_admin",
                label = "مدیر کل",
                permissions = all,
            },
            new
            {
                id = "catalog_manager",
                label = "مدیر کاتالوگ",
                permissions = new[]
                {
                    "dashboard:view",
                    "products:manage",
                    "variants:manage",
                    "specs:manage",
                    "categories:manage",
                    "brands:manage",
                    "media:manage",
                    "inventory:manage",
                    "promotions:manage",
                    "coupons:manage",
                    "cms:manage",
                },
            },
            new
            {
                id = "ops_manager",
                label = "مدیر عملیات",
                permissions = new[]
                {
                    "dashboard:view",
                    "inventory:manage",
                    "sellers:manage",
                    "offers:manage",
                    "orders:manage",
                    "promotions:manage",
                    "coupons:manage",
                    "reports:view",
                    "audit:view",
                },
            },
            new
            {
                id = "support",
                label = "پشتیبانی",
                permissions = new[]
                {
                    "dashboard:view",
                    "orders:manage",
                    "customers:manage",
                    "reviews:moderate",
                    "reports:view",
                },
            },
        };

        return Results.Ok(roles);
    }
}
