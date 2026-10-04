using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Merchandising.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalKeysAndProductKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductIdsJson",
                schema: "merchandising",
                table: "ProductRails");

            migrationBuilder.AlterColumn<string>(
                name: "Subtitle",
                schema: "merchandising",
                table: "ProductRails",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Href",
                schema: "merchandising",
                table: "ProductRails",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalKey",
                schema: "merchandising",
                table: "ProductRails",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProductKeysJson",
                schema: "merchandising",
                table: "ProductRails",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "ExternalKey",
                schema: "merchandising",
                table: "HomeBanners",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_ProductRails_ExternalKey",
                schema: "merchandising",
                table: "ProductRails",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HomeBanners_ExternalKey",
                schema: "merchandising",
                table: "HomeBanners",
                column: "ExternalKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_ProductRails_ExternalKey",
                schema: "merchandising",
                table: "ProductRails");

            migrationBuilder.DropIndex(
                name: "IX_HomeBanners_ExternalKey",
                schema: "merchandising",
                table: "HomeBanners");

            migrationBuilder.DropColumn(
                name: "ExternalKey",
                schema: "merchandising",
                table: "ProductRails");

            migrationBuilder.DropColumn(
                name: "ProductKeysJson",
                schema: "merchandising",
                table: "ProductRails");

            migrationBuilder.DropColumn(
                name: "ExternalKey",
                schema: "merchandising",
                table: "HomeBanners");

            migrationBuilder.AlterColumn<string>(
                name: "Subtitle",
                schema: "merchandising",
                table: "ProductRails",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Href",
                schema: "merchandising",
                table: "ProductRails",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(1000)",
                oldMaxLength: 1000,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProductIdsJson",
                schema: "merchandising",
                table: "ProductRails",
                type: "text",
                nullable: true);
        }
    }
}
