using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;
using static MizeBazi.Models.UserPlaying;

namespace MizeBazi.Models;

public record UserEdit(string FirstName, string LastName, string UserName);

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
    public void Edit(UserEdit model)
    {
        if (string.IsNullOrEmpty(model.FirstName))
            throw MizeBaziException.Error(message: "نام را وارد کنید");
        if (string.IsNullOrEmpty(model.LastName))
            throw MizeBaziException.Error(message: " نام خانوادگی وارد نشده است");

        //if (model.FirstName.Contains(" "))
        //    throw MizeBaziException.Error(message: "نام باید بدون فاصله باشد");
        //if (model.LastName.Contains(" "))
        //    throw MizeBaziException.Error(message: " نام خانوادگی وارد نشده است");

        if (model.LastName.Length < 4 || model.FirstName.Length < 4)
            throw MizeBaziException.Error(message: " نام و نام خانوادگی هر کدام باید بیش از 3 حرف باشد");
        if (model.LastName.Length > 25 || model.FirstName.Length > 25)
            throw MizeBaziException.Error(message: " نام و نام خانوادگی نمیتواند بیش از 25 حرف باشد");

    }
    public void EditUserName(UserEdit model)
    {
        if (model.UserName.Length < 5)
            throw MizeBaziException.Error(message: " نام کاربری باید بیش از 5 حرف باشد");
        if (model.UserName.Length > 25)
            throw MizeBaziException.Error(message: " نام کاربری نمیتواند بیش از 25 حرف باشد");

        if (!Regex.IsMatch(model.UserName, @"^[a-zA-Z0-9]+$"))
            throw MizeBaziException.Error(message: " نام کاربری باید از اعداد و حروف لاتین باشد");
    }
}
public record UserPlaying(long Id, GameType UserGameType, Guid RoomId, Guid Key, string BaseUrl)
{
    public string UserGameName => UserGameType.EnName();
}

[Keyless]
public class UserView : User
{
    public string Bio { get; set; }
    public string Img { get; set; }

    public void SafeData()
    {
        Phone = "";
        //Type = 0;
        //Id = 0;
    }
    public static IEnumerable<object> SafeDictionary(ConcurrentDictionary<string, UserView> initUser)
        => initUser.Select(x => new
        {
            connectionId = x.Key,
            name = $"{x.Value.FirstName} {x.Value.LastName}",
            userName = x.Value.UserName,
            img = x.Value.Img
        });
    public object SafeModel()
        => new
        {
            name = $"{FirstName} {LastName}",
            userName = UserName,
            date = Date,
            img = Img,
            bio = Bio
        };
    public object SafeModelwithoutBio()
        => new
        {
            name = $"{FirstName} {LastName}",
            userName = UserName,
            date = Date,
            img = Img
        };
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

    [Column(TypeName = "Date")] 
    public DateTime BirthDate { get; set; }

    public DateTime Date { get; set; }

}

