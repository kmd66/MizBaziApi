namespace MizeBazi.Models;

public record RequestEdit(RequestEditType Type, long UserId);
public record FriendSearch(string UserName, string Name);

public class Friend
{
    public Guid Id { get; set; }
    public long User1Id { get; set; } // درخواست ازfrom
    public long User2Id { get; set; } // درخواست به to
    public DateTime Date { get; set; }
}