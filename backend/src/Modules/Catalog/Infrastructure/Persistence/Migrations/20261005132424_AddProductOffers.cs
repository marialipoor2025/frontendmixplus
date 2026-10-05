using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductOffers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ProductOffers",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductSlug = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    SellerExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    IsOfficial = table.Column<bool>(type: "boolean", nullable: false),
                    PerformanceLabel = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    DeliveryLabel = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Warranty = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    PriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceCurrency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    OriginalPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    OriginalPriceCurrency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true),
                    DiscountPercent = table.Column<int>(type: "integer", nullable: true),
                    MemberSinceLabel = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    OnTimeSupplyPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    ShipCommitmentPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    NoReturnPercent = table.Column<decimal>(type: "numeric", nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProductOffers", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ProductOffers_ExternalKey",
                schema: "catalog",
                table: "ProductOffers",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProductOffers_ProductId",
                schema: "catalog",
                table: "ProductOffers",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_ProductOffers_ProductSlug",
                schema: "catalog",
                table: "ProductOffers",
                column: "ProductSlug");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ProductOffers",
                schema: "catalog");
        }
    }
}
