using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;

public class GroupMessage
{
    public Guid Id { get; set; }
    public long GroupId { get; set; }
    public long SenderId { get; set; }
    public bool IsPin { get; set; }
    public DateTime Date { get; set; }
    [Column(TypeName = "nvarchar(140)")]
    public string Text { get; set; }
}