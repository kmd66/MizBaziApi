using Azure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using Microsoft.Win32;
using MizeBazi.Models;
using System.ComponentModel.DataAnnotations.Schema;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MizeBazi.DataSource;

public class FlwContexts : DbContext
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("flw");

        friendRequestConfig(ref modelBuilder);
        blockFriendConfig(ref modelBuilder);
        friendConfig(ref modelBuilder);
        messageConfig(ref modelBuilder);
        groupConfig(ref modelBuilder);
        groupMemberConfig(ref modelBuilder);
        //groupMessageConfig(ref modelBuilder);
        notificationConfig(ref modelBuilder);
        viewConfig(ref modelBuilder);
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        optionsBuilder.UseSqlServer(AppStrings.MizeBaziContext, x =>
        {
            x.UseQuerySplittingBehavior(QuerySplittingBehavior.SplitQuery);
        });
        optionsBuilder.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);

    }

    private void friendRequestConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<FriendRequest>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<FriendRequest>()
            .Property(e => e.Date).ValueGeneratedOnAdd().HasDefaultValueSql("GETDATE()");
    }

    private void friendConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Friend>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Friend>()
            .Property(e => e.Date).ValueGeneratedOnAdd().HasDefaultValueSql("GETDATE()");
    }

    private void blockFriendConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BlockFriend>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<BlockFriend>()
            .Property(e => e.Date).ValueGeneratedOnAdd().HasDefaultValueSql("GETDATE()");
    }

    private void messageConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Message>().Property(t => t.Text).IsRequired();

        modelBuilder.Entity<Message>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Message>()
            .Property(e => e.Date).ValueGeneratedOnAdd().HasDefaultValueSql("GETDATE()");
        modelBuilder.Entity<Message>()
            .Property(b => b.IsRemove).HasDefaultValue(false);
    }

    private void groupConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Group>().Property(t => t.Name).IsRequired();
        modelBuilder.Entity<Group>().Property(t => t.Password).IsRequired();

        modelBuilder.Entity<Group>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Group>()
            .Property(b => b.Password).HasDefaultValue("");
        modelBuilder.Entity<Group>()
            .Property(b => b.IsRemove).HasDefaultValue(false);
        modelBuilder.Entity<Group>()
            .Property(e => e.Date).ValueGeneratedOnAdd().HasDefaultValueSql("GETDATE()");
    }

    private void groupMemberConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GroupMember>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<GroupMember>()
            .Property(e => e.Date).ValueGeneratedOnAdd().HasDefaultValueSql("GETDATE()");
        modelBuilder.Entity<GroupMember>()
            .Property(b => b.blocked).HasDefaultValue(false);

        modelBuilder.Entity<GroupMember>()
            .HasOne<Group>()
            .WithMany()
            .HasForeignKey(f => f.GroupId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private void groupMessageConfig(ref ModelBuilder modelBuilder)
    {
        //modelBuilder.Entity<GroupMessage>().Property(t => t.Text).IsRequired();

        //modelBuilder.Entity<GroupMessage>()
        //    .HasIndex(p => p.Id);
        //modelBuilder.Entity<GroupMessage>()
        //    .Property(b => b.Date).HasDefaultValue(DateTime.Now);
        //modelBuilder.Entity<GroupMessage>()
        //    .Property(b => b.IsPin).HasDefaultValue(false);

        //modelBuilder.Entity<GroupMessage>()
        //    .HasOne<Group>()
        //    .WithMany()
        //    .HasForeignKey(f => f.GroupId)
        //    .OnDelete(DeleteBehavior.Restrict);

        //modelBuilder.Entity<GroupMessage>()
        //    .HasOne<User>()
        //    .WithMany()
        //    .HasForeignKey(f => f.SenderId)
        //    .OnDelete(DeleteBehavior.Restrict);
    }

    private void notificationConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notification>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Notification>()
            .Property(e => e.Date).ValueGeneratedOnAdd().HasDefaultValueSql("GETDATE()");
        modelBuilder.Entity<Notification>()
            .Property(b => b.IsRead).HasDefaultValue(false);
    }

    private void viewConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder
               .Entity<GroupView>(eb =>
               {
                   eb.HasNoKey();
                   eb.ToView("UserView");
               });
        modelBuilder
               .Entity<NotificationVeiw>(eb =>
               {
                   eb.HasNoKey();
                   eb.ToView("NotificationVeiw");
               });
        modelBuilder
               .Entity<MessageVeiw>(eb =>
               {
                   eb.HasNoKey();
                   eb.ToView("MessageVeiw");
               });
        modelBuilder
               .Entity<ListMember>(eb =>
               {
                   eb.HasNoKey();
                   eb.ToView("ListMember");
               });
    }

    public DbSet<FriendRequest> FriendRequests { get; set; }
    public DbSet<Friend> Friends { get; set; }
    public DbSet<BlockFriend> BlockFriends { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupMember> GroupMembers { get; set; }
    //public DbSet<GroupMessage> GroupMessages { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<GroupView> GroupViews { get; set; }
    public DbSet<NotificationVeiw> NotificationVeiws { get; set; }
    public DbSet<MessageVeiw> MessageVeiws { get; set; }
    public DbSet<ListMember> ListMember { get; set; }

}
