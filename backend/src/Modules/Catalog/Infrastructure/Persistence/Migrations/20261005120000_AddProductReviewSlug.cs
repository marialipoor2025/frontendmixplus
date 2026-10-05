using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations;

/// <inheritdoc />
public partial class AddProductReviewSlug : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "IsAnonymous",
            schema: "catalog",
            table: "ProductReviews",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "ProductSlug",
            schema: "catalog",
            table: "ProductReviews",
            type: "character varying(200)",
            maxLength: 200,
            nullable: false,
            defaultValue: "");

        migrationBuilder.CreateIndex(
            name: "IX_ProductReviews_ProductSlug",
            schema: "catalog",
            table: "ProductReviews",
            column: "ProductSlug");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropIndex(
            name: "IX_ProductReviews_ProductSlug",
            schema: "catalog",
            table: "ProductReviews");

        migrationBuilder.DropColumn(
            name: "IsAnonymous",
            schema: "catalog",
            table: "ProductReviews");

        migrationBuilder.DropColumn(
            name: "ProductSlug",
            schema: "catalog",
            table: "ProductReviews");
    }
}
