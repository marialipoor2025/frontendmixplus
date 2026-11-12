using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddDigiSellerScrapeTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "DigiCategoryFormSchemas",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DigikalaCategoryId = table.Column<long>(type: "bigint", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LeafTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    CategoryPathJson = table.Column<string>(type: "jsonb", nullable: true),
                    SchemaJson = table.Column<string>(type: "jsonb", nullable: false),
                    ScrapedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigiCategoryFormSchemas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DigiManagedProducts",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DigikalaProductId = table.Column<long>(type: "bigint", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TitleEn = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    BrandTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    BrandId = table.Column<long>(type: "bigint", nullable: true),
                    CategoryTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Status = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    ModerationStatus = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    VariantsCount = table.Column<int>(type: "integer", nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProductUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Site = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    IsOwner = table.Column<bool>(type: "boolean", nullable: false),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    ScrapedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigiManagedProducts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DigiMarketplaceProducts",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DigikalaProductId = table.Column<long>(type: "bigint", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    MinPriceRial = table.Column<long>(type: "bigint", nullable: true),
                    Commission = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    MarketPriceRial = table.Column<long>(type: "bigint", nullable: true),
                    PriceType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    NumberOfSellers = table.Column<int>(type: "integer", nullable: false),
                    IsSelling = table.Column<bool>(type: "boolean", nullable: false),
                    Brand = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    Category = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    Site = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    ScrapedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigiMarketplaceProducts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DigiSellerVariants",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    DigikalaVariantId = table.Column<long>(type: "bigint", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    DigikalaProductId = table.Column<long>(type: "bigint", nullable: false),
                    ProductVariantId = table.Column<long>(type: "bigint", nullable: true),
                    SupplierCode = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ProductTitle = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CategoryTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    CategoryId = table.Column<long>(type: "bigint", nullable: true),
                    Active = table.Column<bool>(type: "boolean", nullable: false),
                    PriceSaleRial = table.Column<long>(type: "bigint", nullable: true),
                    MarketPriceRial = table.Column<long>(type: "bigint", nullable: true),
                    PriceType = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true),
                    SellerStock = table.Column<int>(type: "integer", nullable: true),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    ProductUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    ScrapedAt = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigiSellerVariants", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DigiCategoryFormSchemas_DigikalaCategoryId",
                schema: "catalog",
                table: "DigiCategoryFormSchemas",
                column: "DigikalaCategoryId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigiCategoryFormSchemas_ExternalKey",
                schema: "catalog",
                table: "DigiCategoryFormSchemas",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigiManagedProducts_DigikalaProductId",
                schema: "catalog",
                table: "DigiManagedProducts",
                column: "DigikalaProductId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigiManagedProducts_ExternalKey",
                schema: "catalog",
                table: "DigiManagedProducts",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigiMarketplaceProducts_DigikalaProductId",
                schema: "catalog",
                table: "DigiMarketplaceProducts",
                column: "DigikalaProductId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigiMarketplaceProducts_ExternalKey",
                schema: "catalog",
                table: "DigiMarketplaceProducts",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigiSellerVariants_DigikalaProductId",
                schema: "catalog",
                table: "DigiSellerVariants",
                column: "DigikalaProductId");

            migrationBuilder.CreateIndex(
                name: "IX_DigiSellerVariants_DigikalaVariantId",
                schema: "catalog",
                table: "DigiSellerVariants",
                column: "DigikalaVariantId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_DigiSellerVariants_ExternalKey",
                schema: "catalog",
                table: "DigiSellerVariants",
                column: "ExternalKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DigiCategoryFormSchemas",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "DigiManagedProducts",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "DigiMarketplaceProducts",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "DigiSellerVariants",
                schema: "catalog");
        }
    }
}
