using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;

public record UserDto(long Id, Guid UnicId, string FirstName, string LastName, string Phone, string UserName, byte Type, DateTime Date);

public record UserRegister(Guid UnicId, string Phone);

public class UserValidate
{
    public void SendSecurityStamp(SendSecurityStampDto model)
    {
        if (string.IsNullOrEmpty(model.Phone))
            throw MizeBaziException.Error(message: "شماره تماس را وارد کنید");
        if (model.Phone.Length != 11 || model.Phone[0] != '0' || model.Phone[1] != '9')
            throw MizeBaziException.Error(message: "شماره تماس صحیح وارد نشده است");

    }
}

public class User : BaseModel
{
    [MaxLength(25)]
    public string? FirstName { get; set; }

    [MaxLength(25)]
    public string? LastName { get; set; }

    [Column(TypeName = "varchar(11)")]
    public string Phone { get; set; }

    [MaxLength(25)]
    public string? UserName { get; set; }

    public byte Type { get; set; }

    public DateTime Date { get; set; }

}

