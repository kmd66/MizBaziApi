using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;

public class UserHub
{
    public UserHub(Guid key, string connectionId, UserView user)
    {
        Key = key;
        ConnectionId = connectionId;
        User = user;
        Friends = new List<long>();
    }

    public Guid Key { get; private set; }
    public string ConnectionId { get; private set; }
    public UserView User { get; private set; }
    public List<long> Friends { get; private set; }
};

public record MessageVeiw(long SenderID, long ReceiverID, string Name, string UserName, string img, DateTime LastDate, string Text);

public class Message
{
    public Guid Id { get; set; }
    public long SenderID { get; set; }
    public long ReceiverID { get; set; }
    public bool IsRemove { get; set; }
    public DateTime Date { get; set; }
    [Column(TypeName = "nvarchar(140)")]
    public string Text { get; set; }
}
