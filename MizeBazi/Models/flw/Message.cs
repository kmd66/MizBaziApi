using Azure.Core;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;

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
