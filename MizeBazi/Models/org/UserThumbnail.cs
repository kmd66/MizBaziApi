using Microsoft.EntityFrameworkCore;

namespace MizeBazi.Models;

public record UserThumbnailDto(UserThumbnail Product);

[Index(nameof(Id))]
public class UserThumbnail
{
    public long Id { get; set; }
    public byte[] img { get; set; }
}
