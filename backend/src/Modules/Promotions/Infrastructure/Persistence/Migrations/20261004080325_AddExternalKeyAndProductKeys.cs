using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MixPlus.Modules.Promotions.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddExternalKeyAndProductKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProductIdsJson",
                schema: "promotions",
                table: "OfferCampaigns");

            migrationBuilder.AddColumn<string>(
                name: "ExternalKey",
                schema: "promotions",
                table: "OfferCampaigns",
                type: "character varying(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ProductKeysJson",
                schema: "promotions",
                table: "OfferCampaigns",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.CreateIndex(
                name: "IX_OfferCampaigns_ExternalKey",
                schema: "promotions",
                table: "OfferCampaigns",
                column: "ExternalKey",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_OfferCampaigns_ExternalKey",
                schema: "promotions",
                table: "OfferCampaigns");

            migrationBuilder.DropColumn(
                name: "ExternalKey",
                schema: "promotions",
                table: "OfferCampaigns");

            migrationBuilder.DropColumn(
                name: "ProductKeysJson",
                schema: "promotions",
                table: "OfferCampaigns");

            migrationBuilder.AddColumn<string>(
                name: "ProductIdsJson",
                schema: "promotions",
                table: "OfferCampaigns",
                type: "text",
                nullable: true);
        }
    }
}
