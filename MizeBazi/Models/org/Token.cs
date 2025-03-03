using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;


public record TokenDto(Guid Id, long UserId, string Hash, bool IsValid);

[Index(nameof(Id))]
public class Token
{
    public Guid Id { get; set; }

    [Required]
    public long UserId { get; set; }


    [Required]
    [Column(TypeName = "varchar(32)")]
    public string Hash { get; set; }

    public bool IsValid { get; set; }

}

