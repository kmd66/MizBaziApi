using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;

public record MessageVeiw(long SenderID, string SenderName, string SenderUserName, string img, DateTime LastDate, string Text);

public class MessageAdd
{
    public Message Validate()
    {
        var t = Text.Replace(" ", "");
        if (string.IsNullOrEmpty(t))
            throw MizeBaziException.Error(message: "متن را وارد کنید");
        if (Text.Length > 140) Text = Text.Substring(0, 140);

        return new Message
        {
            Id = Guid.NewGuid(),
            IsRemove = false,
            Date = DateTime.Now,
            Text = Text
        };
    }
    public long ReceiverID { get; set; }
    public string Text { get; set; }
}

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
