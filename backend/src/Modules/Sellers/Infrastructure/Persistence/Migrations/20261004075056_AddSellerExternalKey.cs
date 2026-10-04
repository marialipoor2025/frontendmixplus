using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Sellers.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerExternalKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalKey",
                schema: "sellers",
                table: "Sellers",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Sellers_ExternalKey",
                schema: "sellers",
                table: "Sellers",
                column: "ExternalKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sellers_ExternalKey",
                schema: "sellers",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "ExternalKey",
                schema: "sellers",
                table: "Sellers");
        }
    }
}
