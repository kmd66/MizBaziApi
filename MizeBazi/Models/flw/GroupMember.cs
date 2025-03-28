namespace MizeBazi.Models;

public record ListGroupMember(long UserId, DateTime Date, string UserName, string Name, string img);
public class GroupMember
{
    public Guid Id { get; set; }
    public long GroupId { get; set; }
    public long UserId { get; set; }
    public bool blocked { get; set; }
    public DateTime Date { get; set; }
}