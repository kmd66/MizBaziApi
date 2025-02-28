using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;



[Index(nameof(Id))]
public class Token
{
    public Guid Id { get; set; }

    [Required]
    public long UserId { get; set; }


    [Required]
    [Column(TypeName = "varchar(32)")]
    public string Hash { get; set; }

}

