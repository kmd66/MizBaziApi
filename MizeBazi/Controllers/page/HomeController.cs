using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Helper;
using MizeBazi.Models;

namespace MizeBazi.Controllers;

public class HomeController : Controller
{
    public ActionResult Index()
        => View();



    [AllowAnonymous, HttpGet, Route("TestApi")]
    public Task<Result> TestApi()
        => Result.SuccessfulAsync();

    //[Helper.Authorize]
    [HttpPost, Route("api/CheckHost")]
    public Result<CheckHost> Get()
    {
        return Result<CheckHost>.Successful(data: new CheckHost());
    }

    [HttpPost, Route("api/app/DownloadList")]
    public async Task<Result<List<DownloadItem>>> DownloadList()
    {
        var type = GameType.افسون_واژه.GameBaseUrl();//status
        var result = await new Helper.AppRequest().Post<List<int>>(null, $"{type}/status", false);

        string signalUrl = "https://10.0.3.2:7230";
        string streamUrl = $"http://10.0.3.2:{result.data[0]}";

        List<DownloadItem> list = new List<DownloadItem>{
            //img
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/1.png"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/2.png"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/3.png"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/4.png"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/friend.png"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/group.png"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/room.png"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/WheelFortune.jpg"),
            new DownloadItem(dirName: "img", downloadUrl: $"{signalUrl}/img/WheelFortune.png"),
            
            //font
            new DownloadItem(dirName: "fonts", downloadUrl: $"{signalUrl}/fonts/vazir.ttf"),
            new DownloadItem(dirName: "fonts", downloadUrl: $"{signalUrl}/fonts/icomoon.ttf"),
        
            //libs
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/jalaali.min.js"),
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/jquery.min.js"),
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/msgpack.min.js"),
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/pako.min.js"),
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/sDATA.js"),
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/signalr.min.js"),
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/signalr-protocol-msgpack.min.js"),
            new DownloadItem(dirName: "lib", downloadUrl: $"{signalUrl}/lib/vue.prod.min.js")
        };

        //signal
        list.AddRange(new List<DownloadItem>{
            new DownloadItem(htmlName : "Home", baseUrl:signalUrl, downloadUrl: "/Home"),

            new DownloadItem(htmlName : "Main25", baseUrl:signalUrl, downloadUrl: "/pages/main?gameId=25"),
            new DownloadItem(htmlName : "Main45", baseUrl:signalUrl, downloadUrl: "/pages/main?gameId=45"),
            new DownloadItem(htmlName : "Main68", baseUrl:signalUrl, downloadUrl: "/pages/main?gameId=68"),
            new DownloadItem(htmlName : "Main89", baseUrl:signalUrl, downloadUrl: "/pages/main?gameId=89"),

            new DownloadItem(htmlName : "Help25", baseUrl:signalUrl, downloadUrl: "/pages/help?gameId=25"),
            new DownloadItem(htmlName : "Help45", baseUrl:signalUrl, downloadUrl: "/pages/help?gameId=45"),
            new DownloadItem(htmlName : "Help68", baseUrl:signalUrl, downloadUrl: "/pages/help?gameId=68"),
            new DownloadItem(htmlName : "Help89", baseUrl:signalUrl, downloadUrl: "/pages/help?gameId=89"),
            
            new DownloadItem(htmlName : "Group",  baseUrl:signalUrl, downloadUrl: "/pages/Group"),
            new DownloadItem(htmlName : "Frind",  baseUrl:signalUrl, downloadUrl: "/pages/Friend"),
            new DownloadItem(htmlName : "Room",   baseUrl:signalUrl, downloadUrl: "/pages/Room"),
            new DownloadItem(htmlName : "WheelFortune", baseUrl:signalUrl, downloadUrl: "/pages/WheelFortune"),
        });

        //streams
        list.AddRange(new List<DownloadItem>{
            new DownloadItem(htmlName : "rangOraz", baseUrl:streamUrl, downloadUrl: "/rangOraz"),
            new DownloadItem(dirName: "game", downloadUrl: $"{streamUrl}/game/rangOraz.min.js"),

            new DownloadItem(htmlName : "afsonVajeh", baseUrl:streamUrl, downloadUrl: "/afsonVajeh"),
            new DownloadItem(dirName: "game", downloadUrl: $"{streamUrl}/game/afsonVajeh.min.js"),
            
            new DownloadItem(htmlName : "nabardKhande", baseUrl:streamUrl, downloadUrl: "/nabardKhande"),
            new DownloadItem(dirName: "game", downloadUrl: $"{streamUrl}/game/nabardKhande.min.js"),
            
            new DownloadItem(htmlName : "mafia", baseUrl:streamUrl, downloadUrl: "/mafia"),
            new DownloadItem(dirName: "game", downloadUrl: $"{streamUrl}/game/mafia.min.js")
        });

        return Result<List<DownloadItem>>.Successful(data: list);
    }
    
    [HttpPost, Route("api/app/UpdateList")]
    public async Task<Result<List<DownloadItem>>> UpdateList()
    {

        var type = GameType.افسون_واژه.GameBaseUrl();//status
        var result = await new Helper.AppRequest().Post<List<int>>(null, type);

        string signalUrl = "https://10.0.3.2:7230";
        string streamUrl = $"https://10.0.3.2:{result.data[0]}";

        List<DownloadItem> list = new List<DownloadItem>{};


        return Result<List<DownloadItem>>.Successful(data: list);
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


