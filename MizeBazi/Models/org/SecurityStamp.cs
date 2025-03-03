using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MizeBazi.Models;

public record SendSecurityStampDto(string Phone, string Stamp);
public record SecurityStampDto(Guid Id, string Phone, string Stamp, byte Count, DateTime Date);

public class SecurityStampValidate
{
    public async Task SendSecurityStamp(string phone)
    {
        var securityStampDataSource = new DataSource.SecurityStampDataSource();
        var securityStampResult = await securityStampDataSource.ListByPhone(phone, DateTime.Now.AddDays(-1));

        if(securityStampResult.Data?.Count >= 5)
            throw MizeBaziException.Error(errors: new List<string> {
                    "محدودیت ارسال پیامک.",
                    $"امکان ارسال بیش از 5 پیامک در روز وجود ندارد",
                });
    }
}


[Index(nameof(Id))]
public class SecurityStamp
{
    public Guid Id { get; set; }

    [Required]
    [Column(TypeName = "varchar(11)")]
    public string Phone { get; set; }

    [Required]
    [Column(TypeName = "varchar(5)")]
    public string Stamp { get; set; }

    
    public byte Count { get; set; }


    public DateTime Date { get; set; }

}

