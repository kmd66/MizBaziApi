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
        groupMessageConfig(ref modelBuilder);
        notificationConfig(ref modelBuilder);
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
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);

        modelBuilder.Entity<FriendRequest>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.SenderID)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<FriendRequest>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.ReceiverID)
            .OnDelete(DeleteBehavior.Restrict);

    }

    private void friendConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Friend>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Friend>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);

        modelBuilder.Entity<Friend>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Friend>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.User2Id)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private void blockFriendConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<BlockFriend>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<BlockFriend>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);

        modelBuilder.Entity<BlockFriend>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.User1Id)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<BlockFriend>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.User2Id)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private void messageConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Message>().Property(t => t.Text).IsRequired();

        modelBuilder.Entity<Message>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Message>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);
        modelBuilder.Entity<Message>()
            .Property(b => b.IsRemove).HasDefaultValue(false);

        modelBuilder.Entity<Message>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.SenderID)
            .OnDelete(DeleteBehavior.Restrict);
        modelBuilder.Entity<Message>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.ReceiverID)
            .OnDelete(DeleteBehavior.Restrict);
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
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);

        modelBuilder.Entity<Group>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.CreateId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private void groupMemberConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GroupMember>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<GroupMember>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);

        modelBuilder.Entity<GroupMember>()
            .HasOne<Group>()
            .WithMany()
            .HasForeignKey(f => f.GroupId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GroupMember>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Restrict);
}

    private void groupMessageConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<GroupMessage>().Property(t => t.Text).IsRequired();

        modelBuilder.Entity<GroupMessage>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<GroupMessage>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);
        modelBuilder.Entity<GroupMessage>()
            .Property(b => b.IsPin).HasDefaultValue(false);

        modelBuilder.Entity<GroupMessage>()
            .HasOne<Group>()
            .WithMany()
            .HasForeignKey(f => f.GroupId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<GroupMessage>()
            .HasOne<User>()
            .WithMany()
            .HasForeignKey(f => f.SenderId)
            .OnDelete(DeleteBehavior.Restrict);
    }

    private void notificationConfig(ref ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Notification>()
            .HasIndex(p => p.Id);
        modelBuilder.Entity<Notification>()
            .Property(b => b.Date).HasDefaultValue(DateTime.Now);
        modelBuilder.Entity<Notification>()
            .Property(b => b.IsRead).HasDefaultValue(false);

        modelBuilder.Entity<Notification>()
            .HasOne<User>() 
            .WithMany() 
            .HasForeignKey(f => f.UserId) 
            .OnDelete(DeleteBehavior.Restrict); 
    }

    public DbSet<FriendRequest> FriendRequests { get; set; }
    public DbSet<Friend> Friends { get; set; }
    public DbSet<BlockFriend> BlockFriends { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Group> Groups { get; set; }
    public DbSet<GroupMember> GroupMembers { get; set; }
    public DbSet<GroupMessage> GroupMessages { get; set; }
    public DbSet<Notification> Notifications { get; set; }

}
