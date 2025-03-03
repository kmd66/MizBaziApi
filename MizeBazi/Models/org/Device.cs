using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;


public record DeviceDto(Guid Id, string DeviceId, string Phone, DateTime Date);
public class DeviceGroupBy { public string Phone; public int Count; };

public class DeviceValidate
{
    //ویرایش
    public async Task SendSecurityStamp(DeviceDto model)
    {
        var model2 = model with {Date = DateTime.Now.AddDays(-40) };

        var deviceDataSource = new DataSource.DeviceDataSource();
        var listResult = await deviceDataSource.List(model2);

        if (listResult.Data.Count > 1)
        {
            if(!listResult.Data.Any(x=> x.Phone == model.Phone))
            {
                var phoneNumber = string.Join(", ", listResult.Data.Select(p => p.Phone));
                throw MizeBaziException.Error(errors: new List<string> {
                    "محدودیت ورود",
                    $"لطفا با یکی از شمارههای {phoneNumber} وارد شوید",
                    $"درصورتی که میخاهید با شماره {model.Phone} وارد شوید چند روز  بعد تلاش کنید",
                });
            }
        }

    }
}

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

