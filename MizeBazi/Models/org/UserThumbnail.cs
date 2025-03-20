using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace MizeBazi.Models;

public record UserThumbnailDto(UserThumbnail Product);

public class UserThumbnail
{
    [Key]
    public long Id { get; set; }

    [MaxLength(140)] //معرفی مختصر
    public string Bio { get; set; }
    public byte[] img { get; set; }
}
