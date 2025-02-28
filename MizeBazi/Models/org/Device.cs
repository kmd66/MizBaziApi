using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;



[Index(nameof(Id))]
public class Device
{
    public Guid Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(32)")]
    public string DeviceId { get; set; }

    [Required]
    [Column(TypeName = "varchar(11)")]
    public string Phone { get; set; }
    
    public DateTime Date { get; set; }

}

