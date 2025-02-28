using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;



[Index(nameof(Id))]
public class SecurityStamp
{
    public Guid Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(11)")]
    public string Phone { get; set; }

    [Required]
    [Column(TypeName = "varchar(5)")]
    public string Stamp { get; set; }

    
    public byte Count { get; set; }


    public DateTime Date { get; set; }

}

