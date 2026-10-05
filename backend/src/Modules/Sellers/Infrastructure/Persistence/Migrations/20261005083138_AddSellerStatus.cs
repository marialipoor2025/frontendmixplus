using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Sellers.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Status",
                schema: "sellers",
                table: "Sellers",
                type: "character varying(32)",
                maxLength: 32,
                nullable: false,
                defaultValue: "approved");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Status",
                schema: "sellers",
                table: "Sellers");
        }
    }
}
