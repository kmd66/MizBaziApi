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
        var type = GameType.افسون_واژه;
        var url = type.GameBaseUrl() + type.CreateRoomUrl();

        var room = new
        {
            type = type,
            key = type.CreateRoomKey(),
            users = new List<dynamic>()
        };

        for (var i = 0; i < type.HubCount(); i++)
        {
            room.users.Add(new { id = i, index = 0, type = "", info = "d" });
        }

        var result1 = await new Helper.AppRequest().Post<Guid>(room, url);
        await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");
        await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");
        await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");
        await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");
        await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");
        await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");
        await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");
        var result2 = await new Helper.AppRequest().Post(room, type.GameBaseUrl()+ "/api/test");

        return Result<CheckHost>.Successful(data: new CheckHost());

    }

}


