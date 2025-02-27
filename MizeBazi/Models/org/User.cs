using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;

namespace MizeBazi.Models;

public record UserDto(User Product);

[Index(nameof(UnicId))]
public class User : BaseModel
{
    [MaxLength(25)]
    public string FirstName { get; set; }

    [MaxLength(25)]
    public string LastName { get; set; }

    [MaxLength(11)]
    public string Phone { get; set; }

    [MaxLength(25)]
    public string UserName { get; set; }

    //public string Password { get; set; }

    public byte Type { get; set; }

    public DateTime Date { get; set; }

}

