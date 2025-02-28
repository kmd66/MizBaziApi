//using Azure;
//using Microsoft.EntityFrameworkCore;
//using Microsoft.Extensions.Hosting;
//using Microsoft.Win32;

//namespace MizeBazi.DataSource;

//public class CntContexts : DbContext
//{
//    protected override void OnModelCreating(ModelBuilder modelBuilder)
//    {
//        modelBuilder.HasDefaultSchema("org");
//        postConfig(ref modelBuilder);
//        productConfig(ref modelBuilder);
//        commentConfig(ref modelBuilder);
//        PostOptionConfig(ref modelBuilder);
//    }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//    {
//        optionsBuilder.UseSqlServer(Register.ConnectionString, x =>
//        {
//            x.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
//        });
//        optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);

//    }

//    private void postConfig(ref ModelBuilder modelBuilder)
//    {
//        modelBuilder.Entity<Post>()
//            .HasIndex(p => p.UnicId);
//        modelBuilder.Entity<Post>()
//            .Property(b => b.Img).HasDefaultValue("");
//        modelBuilder
//            .Entity<PostDto>(eb =>
//            {
//                eb.HasNoKey();
//                eb.ToView("PostViwe");
//            });
//        modelBuilder
//            .Entity<PostProduct>(eb =>
//            {
//                eb.HasNoKey();
//                eb.ToView("PostProductViwe");
//            });
//        //modelBuilder.Entity<Post>()
//        //    .Property(b => b.Published).HasDefaultValue(true);
//        //modelBuilder.Entity<Post>()
//        //    .Property(b => b.Special).HasDefaultValue(true);
//        //modelBuilder.Entity<Post>()
//        //    .Property(b => b.Access).HasDefaultValue(1);
//        //modelBuilder.Ignore<PostDto>();


//    }
//    private void productConfig(ref ModelBuilder modelBuilder)
//    {
//        modelBuilder.Entity<Product>()
//            .HasIndex(p => p.UnicId);
//        modelBuilder.Entity<Product>()
//            .Property(b => b.ProductID).HasDefaultValue("");
//        modelBuilder.Entity<Product>()
//            .Property(b => b.Property).HasDefaultValue("");
//        modelBuilder.Entity<Product>()
//            .Property(b => b.Img).HasDefaultValue("");
//    }

//    private void commentConfig(ref ModelBuilder modelBuilder)
//    {
//        modelBuilder.Entity<Comment>()
//            .HasIndex(p => p.UnicId);
//        modelBuilder.Entity<Comment>()
//            .Property(b => b.WebSite).HasDefaultValue("");
//        modelBuilder.Entity<Comment>()
//            .HasIndex(p => p.PostId);

//        modelBuilder.Entity<Score>()
//            .HasIndex(p => p.CommentId);
//        modelBuilder
//            .Entity<CommentDto>(eb =>
//            {
//                eb.HasNoKey();
//                eb.ToView("CommentViwe");
//            });
//        //modelBuilder.Ignore<CommentDto>();
//    }

//    private void PostOptionConfig(ref ModelBuilder modelBuilder)
//    {
//        modelBuilder.Entity<PostOption>()
//            .HasIndex(p => p.UnicId);
//        modelBuilder.Entity<PostOption>()
//            .Property(b => b.Redirect).HasDefaultValue("");
//        //modelBuilder.Entity<PostOption>()
//        //    .Property(b => b.NoFlow).HasDefaultValue(false);
//        //modelBuilder.Entity<PostOption>()
//        //    .Property(b => b.NoIndex).HasDefaultValue(false);
//        //modelBuilder.Entity<PostOption>()
//        //    .Property(b => b.IsScore).HasDefaultValue(true);
//        //modelBuilder.Entity<PostOption>()
//        //    .Property(b => b.Comment).HasDefaultValue(true);
//    }

//    public DbSet<Post> Posts { get; set; }

//    public DbSet<PostOption> PostOptions { get; set; }

//    public DbSet<Tag> Tags { get; set; }

//    public DbSet<Product> Products { get; set; }


//    public DbSet<Comment> Comments { get; set; }

//    public DbSet<Score> Scores { get; set; }

//    public DbSet<PostDto> PostDtos { get; set; }

//    public DbSet<CommentDto> CommentDtos { get; set; }

//    public DbSet<PostProduct> PostProducts { get; set; }
//}
