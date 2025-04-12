using Microsoft.AspNetCore.Mvc;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Text.Json;

namespace MizeBazi.Controllers;

public class HomeController : Controller
{
    public ActionResult Index()
        => View();

    //[Helper.Authorize]
    [HttpPost, Route("api/CheckHost")]
    public Result<CheckHost> Get()
    {
        return Result<CheckHost>.Successful(data: new CheckHost());
    }

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


