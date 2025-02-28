using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;



[Index(nameof(UnicId))]
public class Token: BaseModel
{
    public Guid UnicId { get; set; }
    
    public long UserId { get; set; }


    [Required]
    [Column(TypeName = "varchar(32)")]
    public string Hash { get; set; }

}

