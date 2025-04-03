using SixLabors.ImageSharp;
using System.IO.Compression;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace MizeBazi.Models;

public enum GameType : byte
{
    Unknown = 0,
    نبرد_خنده = 25,
    رنگ_و_راز = 45,
    افسون_واژه = 68,
    مافیا = 89
}

public static class RomHubCountHelper
{
    public static IConfigurationSection GameLinkSection = AppStrings.Configuration.GetRequiredSection("Game");

    public static byte HubCount(this GameType val)
    {
         return val switch
         {
             GameType.نبرد_خنده => 6,
             GameType.رنگ_و_راز=> 5,
             GameType.افسون_واژه => 8,
             GameType.مافیا => 10,
             _ => 0
         };

    }
    public static string GameUrl(this GameType val, Guid id)
        => GameLinkSection[$"Url:{val.ToString()}"]+$"?{id}";
    public static string GameBaseUrl(this GameType val)
        => GameLinkSection[$"BaseUrl:{val.ToString()}"];
    public static string CreateRoomUrl(this GameType val)
        => GameLinkSection["createRoomUrl"];
    public static string CreateRoomKey(this GameType val)
        => GameLinkSection["createRoomKey"];
}
public enum FriendRequestType : byte
{
    Unknown = 0,
    در_انتظار = 1,
    ردشده = 2,
    پذیرفته = 3,
    لغو = 4,
}

public enum RequestEditType : byte
{
    Unknown = 0,

    قبول_کردن = 1,
    رد_کردن = 2,
    مسدود_کردن = 3,
}

public enum NotificationType : byte
{
    Unknown = 0,
    پیام = 1,
    درخواست_دوستی = 2,
    قبول_درخواست = 3,
    رد_درخواست = 4,
}
