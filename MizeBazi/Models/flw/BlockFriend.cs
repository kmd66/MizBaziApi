namespace MizeBazi.Models;

public class BlockFriend
{
    public Guid Id { get; set; }
    public long User1Id { get; set; } // مسدود کننده userBlocker
    public long User2Id { get; set; } // مسدود شده userBlocked 
    public DateTime Date { get; set; }
}