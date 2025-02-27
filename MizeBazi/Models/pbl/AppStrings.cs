using System.Text;

namespace MizeBazi.Models;

public class AppStrings
{
    public static IConfiguration Configuration { get; set; }

    public static string JwtKey 
        => Configuration.GetSection("Jwt:Key").Value!; 
    public static string JwtIv
        => Configuration.GetSection("Jwt:Iv").Value!;

    public static int AccessTokenTime
        =>int.Parse(Configuration.GetSection("Jwt:AccessTokenTime").Value!);
}
