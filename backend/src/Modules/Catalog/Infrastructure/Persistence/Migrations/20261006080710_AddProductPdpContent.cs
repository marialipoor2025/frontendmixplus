using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddProductPdpContent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PdpContentJson",
                schema: "catalog",
                table: "Products",
                type: "jsonb",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PdpContentJson",
                schema: "catalog",
                table: "Products");
        }
    }
}
