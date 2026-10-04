using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalKeysAndCatalogDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BadgesJson",
                schema: "catalog",
                table: "Products",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BrandExternalKey",
                schema: "catalog",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExternalKey",
                schema: "catalog",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "SellerExternalKey",
                schema: "catalog",
                table: "Products",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExternalKey",
                schema: "catalog",
                table: "Categories",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Href",
                schema: "catalog",
                table: "Categories",
                type: "character varying(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ExternalKey",
                schema: "catalog",
                table: "Brands",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ExternalKey",
                schema: "catalog",
                table: "Products",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Categories_ExternalKey",
                schema: "catalog",
                table: "Categories",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Brands_ExternalKey",
                schema: "catalog",
                table: "Brands",
                column: "ExternalKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Products_ExternalKey",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropIndex(
                name: "IX_Categories_ExternalKey",
                schema: "catalog",
                table: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_Brands_ExternalKey",
                schema: "catalog",
                table: "Brands");

            migrationBuilder.DropColumn(
                name: "BadgesJson",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "BrandExternalKey",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ExternalKey",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "SellerExternalKey",
                schema: "catalog",
                table: "Products");

            migrationBuilder.DropColumn(
                name: "ExternalKey",
                schema: "catalog",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "Href",
                schema: "catalog",
                table: "Categories");

            migrationBuilder.DropColumn(
                name: "ExternalKey",
                schema: "catalog",
                table: "Brands");
        }
    }
}
