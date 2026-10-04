using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Navigation.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "navigation");

            migrationBuilder.CreateTable(
                name: "MainNavs",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    CategoryTriggerLabel = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SellerCtaTitle = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    SellerCtaHref = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MainNavs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "NavContents",
                schema: "navigation",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    PayloadJson = table.Column<string>(type: "jsonb", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_NavContents", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_NavContents_Key",
                schema: "navigation",
                table: "NavContents",
                column: "Key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MainNavs",
                schema: "navigation");

            migrationBuilder.DropTable(
                name: "NavContents",
                schema: "navigation");
        }
    }
}
