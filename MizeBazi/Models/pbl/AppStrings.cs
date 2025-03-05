using System.Text;

namespace MizeBazi.Models;

public class AppStrings
{
    public static IConfiguration Configuration { get; set; }

    public static string MizeBaziContext
        => Configuration.GetSection("ConnectionStrings:MizeBaziContext").Value!;


    public static string JwtKey 
        => Configuration.GetSection("Jwt:Key").Value!; 
    public static string JwtIv
        => Configuration.GetSection("Jwt:Iv").Value!;

    public static int AccessTokenTime
        =>int.Parse(Configuration.GetSection("Jwt:AccessTokenTime").Value!);


    public static int AvatarSize
        => int.Parse(Configuration.GetSection("File:AvatarSize").Value!);
    public static int AvatarMaxWidth
        => int.Parse(Configuration.GetSection("File:AvatarMaxWidth").Value!);
    public static int AvatarMaxHeigh
        => int.Parse(Configuration.GetSection("File:AvatarMaxHeigh").Value!);
}
