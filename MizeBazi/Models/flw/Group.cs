using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;

public class Group
{
    public long Id { get; set; }
    public long CreateId { get; set; }
    public string Name { get; set; }
    public string Password { get; set; }
    public DateTime Date { get; set; }
    public bool IsRemove { get; set; }
    [Column(TypeName = "nvarchar(140)")]
    public string Description { get; set; }
}
