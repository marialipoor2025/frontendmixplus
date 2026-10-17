using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Promotions.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferNominations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OfferNominations",
                schema: "promotions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ProductExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerId = table.Column<Guid>(type: "uuid", nullable: false),
                    SellerExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    RejectionReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    NominatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndsAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    DiscountPercent = table.Column<int>(type: "integer", nullable: false),
                    SalePrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    ListPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    ProductPublished = table.Column<bool>(type: "boolean", nullable: false),
                    ProductInStock = table.Column<bool>(type: "boolean", nullable: false),
                    ProductRating = table.Column<decimal>(type: "numeric(4,2)", precision: 4, scale: 2, nullable: true),
                    ProductReviewCount = table.Column<int>(type: "integer", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfferNominations", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfferNominations_ExternalKey",
                schema: "promotions",
                table: "OfferNominations",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfferNominations_SellerId_ProductExternalKey",
                schema: "promotions",
                table: "OfferNominations",
                columns: new[] { "SellerId", "ProductExternalKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OfferNominations_Status",
                schema: "promotions",
                table: "OfferNominations",
                column: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OfferNominations",
                schema: "promotions");
        }
    }
}
