using SixLabors.ImageSharp;
using System.IO.Compression;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MizeBazi.Models;

public enum GameType : byte
{
    Unknown = 0,
    نبرد_خنده = 25,
    رنگ_و_راز = 45,
    آفسون_واژه = 68,
    مافیا = 89
}

public static class RomHubCountHelper
{
    public static IConfigurationSection GameLinkSection = AppStrings.Configuration.GetRequiredSection("GameLink");

    public static byte HubCount(this GameType val)
    {
         return val switch
         {
             GameType.نبرد_خنده => 6,
             GameType.رنگ_و_راز=> 5,
             GameType.آفسون_واژه => 8,
             GameType.مافیا => 10,
             _ => 0
         };

    }
    public static string GameLink(this GameType val)
        => GameLinkSection[val.ToString()];
}
public enum RequestsType : byte
{
    Unknown = 0,
    در_انتظار = 1,
    ردشده = 2,
    پذیرفته = 3,
    لغو = 4,
}
public enum NotificationType : byte
{
    Unknown = 0,
    پیام = 1,
    درخواست_دوستی = 2,
}
