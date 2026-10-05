using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductVariants : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OptionGroups",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Code = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: false),
                    Name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Ui = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OptionGroups", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Skus",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProductExternalKey = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    SkuCode = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    OptionValueIdsJson = table.Column<string>(type: "jsonb", nullable: false),
                    PriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    PriceCurrency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: false),
                    OriginalPriceAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: true),
                    OriginalPriceCurrency = table.Column<string>(type: "character varying(8)", maxLength: 8, nullable: true),
                    DiscountPercent = table.Column<int>(type: "integer", nullable: true),
                    Stock = table.Column<int>(type: "integer", nullable: false),
                    InStock = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skus", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "OptionValues",
                schema: "catalog",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Label = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    SwatchHex = table.Column<string>(type: "character varying(40)", maxLength: 40, nullable: true),
                    Available = table.Column<bool>(type: "boolean", nullable: false),
                    SortOrder = table.Column<int>(type: "integer", nullable: false),
                    OptionGroupId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OptionValues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OptionValues_OptionGroups_OptionGroupId",
                        column: x => x.OptionGroupId,
                        principalSchema: "catalog",
                        principalTable: "OptionGroups",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OptionGroups_ProductId_Code",
                schema: "catalog",
                table: "OptionGroups",
                columns: new[] { "ProductId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_OptionValues_OptionGroupId",
                schema: "catalog",
                table: "OptionValues",
                column: "OptionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_Skus_ProductId",
                schema: "catalog",
                table: "Skus",
                column: "ProductId");

            migrationBuilder.CreateIndex(
                name: "IX_Skus_SkuCode",
                schema: "catalog",
                table: "Skus",
                column: "SkuCode",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OptionValues",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "Skus",
                schema: "catalog");

            migrationBuilder.DropTable(
                name: "OptionGroups",
                schema: "catalog");
        }
    }
}
