using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Cart.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class AddOrderLineSellerExternalKey : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<string>(
            name: "SellerExternalKey",
            schema: "cart",
            table: "OrderLines",
            type: "character varying(100)",
            maxLength: 100,
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateIndex(
            name: "IX_OrderLines_SellerExternalKey",
            schema: "cart",
            table: "OrderLines",
            column: "SellerExternalKey");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_OrderLines_SellerExternalKey",
            schema: "cart",
            table: "OrderLines");

        migrationBuilder.DropColumn(
            name: "SellerExternalKey",
            schema: "cart",
            table: "OrderLines");
    }
}
