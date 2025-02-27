using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace MizeBazi.Models;



[Index(nameof(UnicId))]
public class Token: BaseModel
{
    public Guid UnicId { get; set; }
    
    public long UserId { get; set; }
    
    [MaxLength(32)]
    public string Hash { get; set; }

}

