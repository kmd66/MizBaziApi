namespace MizeBazi.Models;

public class GroupMember
{
    public Guid Id { get; set; }
    public long GroupId { get; set; }
    public long UserId { get; set; }
    public DateTime Date { get; set; }
}
