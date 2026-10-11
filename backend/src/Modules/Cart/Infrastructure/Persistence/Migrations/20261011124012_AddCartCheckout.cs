using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Cart.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCartCheckout : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AddressSnapshotJson",
                schema: "cart",
                table: "Orders",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "CouponCode",
                schema: "cart",
                table: "Orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                schema: "cart",
                table: "Orders",
                type: "character varying(8)",
                maxLength: 8,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "DiscountAmount",
                schema: "cart",
                table: "Orders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "GiftCardAmount",
                schema: "cart",
                table: "Orders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "PaymentIntentId",
                schema: "cart",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                schema: "cart",
                table: "Orders",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PickupBranchId",
                schema: "cart",
                table: "Orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PickupBranchLabel",
                schema: "cart",
                table: "Orders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ShippingAmount",
                schema: "cart",
                table: "Orders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "ShippingLabel",
                schema: "cart",
                table: "Orders",
                type: "character varying(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ShippingMethod",
                schema: "cart",
                table: "Orders",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "SubtotalAmount",
                schema: "cart",
                table: "Orders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                schema: "cart",
                table: "Orders",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WalletAmount",
                schema: "cart",
                table: "Orders",
                type: "numeric(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateTable(
                name: "Addresses",
                schema: "cart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ReceiverName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Phone = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Province = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    City = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PostalCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    AddressLine = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Carts",
                schema: "cart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    CouponCode = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    GiftCardCode = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: true),
                    WalletAmountApplied = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Carts", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GiftCards",
                schema: "cart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    RedeemedByUserId = table.Column<Guid>(type: "uuid", nullable: true),
                    ExpiresAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<string>(type: "character varying(16)", maxLength: 16, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GiftCards", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OrderLines",
                schema: "cart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductSlug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    OfferExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SkuExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    VariantLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OrderLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OrderLines_Orders_OrderId",
                        column: x => x.OrderId,
                        principalSchema: "cart",
                        principalTable: "Orders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Payments",
                schema: "cart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    OrderId = table.Column<Guid>(type: "uuid", nullable: true),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                    Gateway = table.Column<string>(type: "character varying(64)", maxLength: 64, nullable: false),
                    FailureReason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CheckoutPayloadJson = table.Column<string>(type: "text", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CompletedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Wallets",
                schema: "cart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Balance = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wallets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CartLines",
                schema: "cart",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CartId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductSlug = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    OfferExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SkuExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SellerName = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Title = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    ImageUrl = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    VariantLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: true),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    OriginalPrice = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    DiscountPercent = table.Column<int>(type: "integer", nullable: true),
                    Currency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    StockAvailable = table.Column<int>(type: "integer", nullable: false),
                    InStock = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CartLines", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CartLines_Carts_CartId",
                        column: x => x.CartId,
                        principalSchema: "cart",
                        principalTable: "Carts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                schema: "cart",
                table: "Orders",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_UserId",
                schema: "cart",
                table: "Addresses",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CartLines_CartId_OfferExternalKey_SkuExternalKey",
                schema: "cart",
                table: "CartLines",
                columns: new[] { "CartId", "OfferExternalKey", "SkuExternalKey" });

            migrationBuilder.CreateIndex(
                name: "IX_Carts_UserId",
                schema: "cart",
                table: "Carts",
                column: "UserId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_GiftCards_Code",
                schema: "cart",
                table: "GiftCards",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OrderLines_OrderId",
                schema: "cart",
                table: "OrderLines",
                column: "OrderId");

            migrationBuilder.CreateIndex(
                name: "IX_Payments_ExternalKey",
                schema: "cart",
                table: "Payments",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_UserId",
                schema: "cart",
                table: "Payments",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Wallets_UserId",
                schema: "cart",
                table: "Wallets",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Addresses",
                schema: "cart");

            migrationBuilder.DropTable(
                name: "CartLines",
                schema: "cart");

            migrationBuilder.DropTable(
                name: "GiftCards",
                schema: "cart");

            migrationBuilder.DropTable(
                name: "OrderLines",
                schema: "cart");

            migrationBuilder.DropTable(
                name: "Payments",
                schema: "cart");

            migrationBuilder.DropTable(
                name: "Wallets",
                schema: "cart");

            migrationBuilder.DropTable(
                name: "Carts",
                schema: "cart");

            migrationBuilder.DropIndex(
                name: "IX_Orders_UserId",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AddressSnapshotJson",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "CouponCode",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Currency",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "DiscountAmount",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "GiftCardAmount",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentIntentId",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PickupBranchId",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "PickupBranchLabel",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShippingAmount",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShippingLabel",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "ShippingMethod",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "SubtotalAmount",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "UserId",
                schema: "cart",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "WalletAmount",
                schema: "cart",
                table: "Orders");
        }
    }
}
