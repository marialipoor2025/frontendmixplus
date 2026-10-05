using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using MixPlus.Modules.Catalog.Infrastructure.Persistence;

#nullable disable

namespace MixPlus.Modules.Catalog.Infrastructure.Persistence.Migrations;

[DbContext(typeof(CatalogDbContext))]
[Migration("20261005120000_AddProductReviewSlug")]
partial class AddProductReviewSlug
{
}
