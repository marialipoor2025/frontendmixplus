using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Navigation.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class NormalizeMegaMenuAndQuickLinks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MainNavs",
                schema: "navigation");

            migrationBuilder.CreateTable(
                name: "MegaCategories",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Href = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    AllProductsLabel = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MegaCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MegaColumns",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CategoryExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MegaColumns", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "MegaLinks",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    ColumnExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Href = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Kind = table.Column<int>(type: "integer", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MegaLinks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NavSettings",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    CategoryTriggerLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SellerCtaTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SellerCtaHref = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NavSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuickLinks",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "character varying(300)", maxLength: 300, nullable: false),
                    Href = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: false),
                    Icon = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    External = table.Column<bool>(type: "boolean", nullable: false),
                    Badge = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuickLinks", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MegaCategories_ExternalKey",
                schema: "navigation",
                table: "MegaCategories",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MegaColumns_CategoryExternalKey",
                schema: "navigation",
                table: "MegaColumns",
                column: "CategoryExternalKey");

            migrationBuilder.CreateIndex(
                name: "IX_MegaColumns_ExternalKey",
                schema: "navigation",
                table: "MegaColumns",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MegaLinks_ColumnExternalKey",
                schema: "navigation",
                table: "MegaLinks",
                column: "ColumnExternalKey");

            migrationBuilder.CreateIndex(
                name: "IX_MegaLinks_ExternalKey",
                schema: "navigation",
                table: "MegaLinks",
                column: "ExternalKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_NavSettings_Key",
                schema: "navigation",
                table: "NavSettings",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_QuickLinks_ExternalKey",
                schema: "navigation",
                table: "QuickLinks",
                column: "ExternalKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MegaCategories",
                schema: "navigation");

            migrationBuilder.DropTable(
                name: "MegaColumns",
                schema: "navigation");

            migrationBuilder.DropTable(
                name: "MegaLinks",
                schema: "navigation");

            migrationBuilder.DropTable(
                name: "NavSettings",
                schema: "navigation");

            migrationBuilder.DropTable(
                name: "QuickLinks",
                schema: "navigation");

            migrationBuilder.CreateTable(
                name: "MainNavs",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryTriggerLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SellerCtaHref = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    SellerCtaTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MainNavs", x => x.Id);
                });
        }
    }
}
