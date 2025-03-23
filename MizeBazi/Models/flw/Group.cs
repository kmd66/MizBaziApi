using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.RegularExpressions;

namespace MizeBazi.Models;

public record GroupAdd(string UniqueName, string Name, string Password, string Description);
public record GroupEdit(long Id, string Name, string Password, string Description);
public record GroupJoin(long Id, string Password);

public class GroupValidate
{
    public void Add(GroupAdd model, bool edite = false)
    {
        var name = model.Name.Replace(" ", "");
        if (string.IsNullOrEmpty(name))
            throw MizeBaziException.Error(message: "نام را وارد کنید");
        if (model.Name.Length < 5 || model.Name.Length > 25)
            throw MizeBaziException.Error(message: " نام باید بین 5 تا 25 حرف باشد");

        if (!edite)
        {
            if (string.IsNullOrEmpty(model.UniqueName))
                throw MizeBaziException.Error(message: "شناسه را وارد کنید");
            if (model.UniqueName.Length < 5 || model.UniqueName.Length > 25)
                throw MizeBaziException.Error(message: " شناسه باید بین 5 تا 25 حرف باشد");
            if (!Regex.IsMatch(model.UniqueName, @"^[a-zA-Z0-9]+$"))
                throw MizeBaziException.Error(message: " شناسه باید از اعداد و حروف لاتین باشد");
        }

        if (!string.IsNullOrEmpty(model.Description))
        {
            if (model.Description.Length < 14 || model.Description.Length > 140)
                throw MizeBaziException.Error(message: "توضیح باید بین 14 تا 140 حرف باشد");
        }

        if (!string.IsNullOrEmpty(model.Password))
        {
            if (model.Password.Length < 5 || model.Password.Length > 25)
                throw MizeBaziException.Error(message: " رمز عبور باید بین 5 تا 25 حرف باشد");
            if (!Regex.IsMatch(model.Password, @"^[a-zA-Z0-9]+$"))
                throw MizeBaziException.Error(message: " رمز عبور باید از اعداد و حروف لاتین باشد");
        }

    }
    public void Edite(GroupEdit model)
        => Add(new GroupAdd("", model.Name, model.Password, model.Description), true);
}

[Keyless]
public class GroupView : Group
{
    public string CreateName { get; set; }
    public int Count { get; set; }
    //public string LastText { get; set; }
    //public DateTime LastTextDate { get; set; }
}

public class Group
{
    public long Id { get; set; }
    public long CreateId { get; set; }

    [MaxLength(25)]
    public string UniqueName { get; set; }

    [MaxLength(25)]
    public string Name { get; set; }

    [MaxLength(25)]
    public string Password { get; set; }
    public DateTime Date { get; set; }
    public bool IsRemove { get; set; }
    [Column(TypeName = "nvarchar(140)")]
    public string Description { get; set; }
}
