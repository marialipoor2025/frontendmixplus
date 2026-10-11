using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductCommerceAndSeo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowCashOnDelivery",
                schema: "catalog",
                table: "Products",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<decimal>(
                name: "DutyPercent",
                schema: "catalog",
                table: "Products",
                type: "numeric(9,2)",
                precision: 9,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageAlt",
                schema: "catalog",
                table: "Products",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetaDescription",
                schema: "catalog",
                table: "Products",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetaKeywords",
                schema: "catalog",
                table: "Products",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MetaTitle",
                schema: "catalog",
                table: "Products",
                type: "character varying(300)",
                maxLength: 300,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MinOrderQuantity",
                schema: "catalog",
                table: "Products",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "SchemaJson",
                schema: "catalog",
                table: "Products",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SkuCode",
                schema: "catalog",
                table: "Products",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TaxPercent",
                schema: "catalog",
                table: "Products",
                type: "numeric(9,2)",
                precision: 9,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "WeightKg",
                schema: "catalog",
                table: "Products",
                type: "numeric(18,3)",
                precision: 18,
                scale: 3,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Products_SkuCode",
                schema: "catalog",
                table: "Products",
                column: "SkuCode");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_SkuCode",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "AllowCashOnDelivery",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "DutyPercent",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ImageAlt",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MetaDescription",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MetaKeywords",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MetaTitle",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "MinOrderQuantity",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SchemaJson",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SkuCode",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "TaxPercent",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "WeightKg",
                schema: "catalog",
                table: "Products");
        }
    }
}
