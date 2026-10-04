using Microsoft.EntityFrameworkCore;
using MixPlus.Modules.Catalog.Domain.Brands;
using MixPlus.Modules.Catalog.Domain.Categories;
using MixPlus.Modules.Catalog.Domain.Products;

namespace MixPlus.Modules.Catalog.Application.Abstractions;

public interface ICatalogDbContext
{
    DbSet<Product> Products { get; }
    DbSet<Brand> Brands { get; }
    DbSet<Category> Categories { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
