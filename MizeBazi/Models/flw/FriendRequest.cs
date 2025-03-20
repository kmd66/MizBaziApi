namespace MizeBazi.Models;

public class FriendRequest
{
    public Guid Id { get; set; }
    public long SenderID { get; set; }
    public long ReceiverID { get; set; }
    public RequestsType Type { get; set; }
    public DateTime Date { get; set; }

}