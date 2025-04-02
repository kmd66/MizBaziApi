using Microsoft.AspNetCore.Mvc;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Text.Json;

namespace MizeBazi.Controllers;

public class HomeController : Controller
{
    public ActionResult Index()
        => View();

    public ActionResult WheelFortune()
        => View();

    public ActionResult Room()
        => View("~/Views/Pages/Room/Room.cshtml");

    //[Helper.Authorize]
    [HttpPost, Route("api/CheckHost")]
    public Result<CheckHost> Get()
        => Result<CheckHost>.Successful(data: new CheckHost());

    [HttpGet, Route("api/getCheckHost")]
    public Result<CheckHost> GetCheckHost()
        => Result<CheckHost>.Successful(data: new CheckHost());

    [HttpGet, Route("api/testroom")]
    public async Task<Result<CheckHost>> testroom()
    {
        var type = GameType.آفسون_واژه;
        var url = type.GameBaseUrl() + type.CreateRoomUrl();
        var url2 = type.GameBaseUrl() + "/api/test";

        var room = new
        {
            id = Guid.NewGuid(),
            type = type,
            info = "info: test",
            users = new List<dynamic>()
        };

        for (var i = 0; i < 3; i++)
        {
            room.users.Add(new aUser(i, 0, "string type", "user info " + i));
        }

        var result = await new AppRequest().Post(room, url);
        var result2 = await new AppRequest().Post<aRoomUsers>(room, url2);

        return Result<CheckHost>.Successful(data: new CheckHost());

    }

}


public record aUser(int id, int index, string type, string info);
public record aRoomUsers(Guid id, GameType type, string info, List<aUser> users);
