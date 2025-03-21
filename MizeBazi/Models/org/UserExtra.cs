using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MizeBazi.Models;


public class UserExtra
{
    public long Id { get; set; }

    [MaxLength(140)]
    public string Bio { get; set; }
    public string img { get; set; }
}
