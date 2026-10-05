using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Products;
using MixPlus.Modules.Catalog.Domain.Specs;
using MixPlus.Modules.Catalog.Domain.Variants;

namespace MixPlus.Modules.Catalog.Application.Abstractions;

public interface ICatalogDbContext
{
    DbSet<Product> Products { get; }
    DbSet<Brand> Brands { get; }
    DbSet<Category> Categories { get; }
    DbSet<ProductOptionGroup> OptionGroups { get; }
    DbSet<ProductSku> Skus { get; }
    DbSet<ProductSpecGroup> SpecGroups { get; }
    DbSet<SpecDefinition> SpecDefinitions { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
