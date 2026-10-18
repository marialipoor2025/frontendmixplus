using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MixPlus.Modules.Merchandising.Infrastructure.Persistence;

#nullable disable

namespace MixPlus.Modules.Merchandising.Infrastructure.Persistence.Migrations;

[DbContext(typeof(MerchandisingDbContext))]
[Migration("20261018010000_AddRailCardDisplayFlags")]
public partial class AddRailCardDisplayFlags : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.AddColumn<bool>(
            name: "ShowReviewScore",
            schema: "merchandising",
            table: "ProductRails",
            type: "boolean",
            nullable: false,
            defaultValue: true);

        migrationBuilder.AddColumn<bool>(
            name: "ShowCardLabels",
            schema: "merchandising",
            table: "ProductRails",
            type: "boolean",
            nullable: false,
            defaultValue: false);

        migrationBuilder.AddColumn<string>(
            name: "LabelPosition",
            schema: "merchandising",
            table: "ProductRails",
            type: "character varying(32)",
            maxLength: 32,
            nullable: false,
            defaultValue: "beside");
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropColumn(
            name: "ShowReviewScore",
            schema: "merchandising",
            table: "ProductRails");

        migrationBuilder.DropColumn(
            name: "ShowCardLabels",
            schema: "merchandising",
            table: "ProductRails");

        migrationBuilder.DropColumn(
            name: "LabelPosition",
            schema: "merchandising",
            table: "ProductRails");
    }
}
