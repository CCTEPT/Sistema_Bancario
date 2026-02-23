 using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AccountService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace AccountService.Persistence.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<BankAccount> BankAccounts { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<BankAccount>(entity =>
        {
            entity.HasKey(e => e.IdCuenta);

            entity.Property(e => e.IdCuenta)
                .ValueGeneratedOnAdd();

            entity.Property(e => e.NumeroCuenta)
                .IsRequired()
                .HasMaxLength(50);

            entity.HasIndex(e => e.NumeroCuenta)
                .IsUnique();

            entity.Property(e => e.Saldo)
                .HasColumnType("numeric(18,2)");

            entity.Property(e => e.TipoCuenta)
                .IsRequired()
                .HasMaxLength(50);

            entity.Property(e => e.Divisa)
                .IsRequired()
                .HasMaxLength(10);

            entity.Property(e => e.IdUsuario)
                .IsRequired();

            entity.HasIndex(e => e.IdUsuario);

            entity.Property(e => e.Estado)
                .IsRequired()
                .HasMaxLength(20)
                .HasDefaultValue("Activa");

            entity.Property(e => e.FechaCreacion)
                .IsRequired();
        });

        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName()!));

            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.Name));
            }

            foreach (var key in entity.GetKeys())
            {
                key.SetName(ToSnakeCase(key.GetName()!));
            }

            foreach (var foreignKey in entity.GetForeignKeys())
            {
                foreignKey.SetConstraintName(ToSnakeCase(foreignKey.GetConstraintName()!));
            }

            foreach (var index in entity.GetIndexes())
            {
                index.SetDatabaseName(ToSnakeCase(index.GetDatabaseName()!));
            }
        }
    }

    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return input;

        return string.Concat(
            input.Select((c, i) =>
                i > 0 && char.IsUpper(c) ? "_" + c : c.ToString()
            )
        ).ToLower();
    }

    private void UpdateTimeStamp()
    {
        var entries = ChangeTracker.Entries<BankAccount>()
            .Where(e => e.State == EntityState.Added);

        foreach (var entry in entries)
        {
            entry.Entity.FechaCreacion = DateTime.UtcNow;
        }
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        UpdateTimeStamp();
        return base.SaveChangesAsync(cancellationToken);
    }
}