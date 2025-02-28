using Azure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Win32;
using MizeBazi.Models;

namespace MizeBazi.DataSource;

public class OrgContexts : DbContext
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("org");
        securityStampConfig(ref modelBuilder);
        deviceConfig(ref modelBuilder);
        tokenConfig(ref modelBuilder);
        userConfig(ref modelBuilder);
        UsersThumbnailConfig(ref modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(AppStrings.MizeBaziContext, x =>
        {
            x.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        });
        optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);

    }

    private void securityStampConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<SecurityStamp>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<SecurityStamp>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);
        modelBuilder.Entity<SecurityStamp>()
            .Property(b => b.Count).HasDefaultValue(0);
    }
    private void deviceConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Device>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Device>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);
    }
    private void tokenConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Token>()
            .HasIndex(p => p.Id);
    }
    private void userConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(p => p.UnicId);
        modelBuilder.Entity<User>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);
        modelBuilder.Entity<User>()
            .Property(b => b.Type).HasDefaultValue(1);
    }
    private void UsersThumbnailConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<UserThumbnail>()
            .HasIndex(p => p.Id);
    }

    public DbSet<SecurityStamp> SecurityStamps { get; set; }
    public DbSet<Device> Devices { get; set; }
    public DbSet<Token> Tokens { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<UserThumbnail> UsersThumbnail { get; set; }

}
