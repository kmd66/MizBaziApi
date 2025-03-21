namespace MizeBazi.Models;

public class FriendRequest
{
    public Guid Id { get; set; }
    public long SenderID { get; set; }
    public long ReceiverID { get; set; }
    public FriendRequestType Type { get; set; }
    public DateTime Date { get; set; }

}