using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Sellers.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddSellerOwnerUserId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OwnerUserId",
                schema: "sellers",
                table: "Sellers",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sellers_OwnerUserId",
                schema: "sellers",
                table: "Sellers",
                column: "OwnerUserId",
                unique: true,
                filter: "\"OwnerUserId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sellers_OwnerUserId",
                schema: "sellers",
                table: "Sellers");

            migrationBuilder.DropColumn(
                name: "OwnerUserId",
                schema: "sellers",
                table: "Sellers");
        }
    }
}
