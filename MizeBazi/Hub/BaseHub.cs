using Microsoft.AspNetCore.SignalR;
using Microsoft.IdentityModel.Tokens;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace MizeBazi.HubControllers;
public abstract class MainHub : Hub
{
    public static ConcurrentDictionary<long, UserPlaying> Playing = new ConcurrentDictionary<long, UserPlaying>();

    public abstract Task Init(string auth, string dId);
    protected abstract Task start();

    readonly JwtHelper _jwt;
    protected GameType _type = 0;
    protected byte _count = 0;

    public MainHub(GameType type)
    {
        _type = type;
        _count = type.HubCount();
        _jwt = new JwtHelper();
    }

    protected async Task _disconnected(ConcurrentDictionary<string, UserView> initUser)
    {
        var connectionId = Context.ConnectionId;
        if (initUser.ContainsKey(connectionId))
        {
            var keyToRemove = initUser.Where(x => x.Value.Id == initUser[connectionId].Id).Select(x => x.Key).ToList();

            // اصلاح
            //foreach (var key in keyToRemove)
            //{
            //    initUser.Remove(key);
            //}
            initUser.TryRemove(connectionId, out _);
            if (initUser.Count > 0)
               await Clients.All.SendAsync("InitReceive", UserView.SafeDictionary(initUser).ToJson());
        }

    }

    protected async Task _init(string auth, string dId, ConcurrentDictionary<string, UserView> initUser)
    {
        var connectionId = Context.ConnectionId;
        if (initUser.ContainsKey(connectionId))
            return;

        var model = _jwt.Decode(auth);
        if (model == null)
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }

        foreach (var t in initUser)
        {
            // اصلاح
            //if (t.Value.Id == model.UserId)
            //    return;
        }

        var tokenDataSource = new DataSource.TokenDataSource();
        var tokenResult = await tokenDataSource.Get(model.Id);
        if (model.DeviceId != dId
            || tokenResult.data == null
            || tokenResult.data.Hash != auth.Md5())
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }


        var userDataSource = new DataSource.UserDataSource();
        var userResult = await userDataSource.GetViwe(model.UserId);
        if (userResult.data == null)
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }
        if (!string.IsNullOrEmpty(userResult.data.Img))
            userResult.data.Img = RomHubCountHelper.apiUrl() + userResult.data.Img;

        if (Playing.TryGetValue(userResult.data.Id, out UserPlaying userPlaying))
        {
            //Playing.Clear();
            // اصلاح
            //await Clients.Caller.SendAsync("ReloadtGameReceive", userPlaying.UserGameType.GameUrl(userPlaying.RoomId));
            //return;
        }

        RomHubCountHelper.apiUrl();
        initUser.TryAdd(connectionId, userResult.data);

        if (initUser.Count == _count)
            await start();
        else
           await Clients.All.SendAsync("InitReceive", UserView.SafeDictionary(initUser).ToJson());
    }

    protected async Task _start(ConcurrentDictionary<string, UserView> initUser)
    {
        var keys = initUser.Keys.Take(_count).ToList();
        List<HubUserGameRemove> users = new List<HubUserGameRemove>();
        foreach (var k in keys)
        {
            initUser.TryRemove(k, out UserView u);
            users.Add(new HubUserGameRemove(k, u));
        }
        await Clients.Clients(keys).SendAsync("WaitGameReceive");

        var url = _type.GameBaseUrl() + _type.CreateRoomUrl();
        var room = new
        {
            type = _type,
            key = _type.CreateRoomKey(),
            users = new List<dynamic>()
        };

        foreach (var user in users)
        {
            user.user.SafeData();
            room.users.Add(new { id = user.user.Id, info = user.user });
        }

        var result = await new Helper.AppRequest().Post<HubUserGameResult>(room, url);
        if (!result.success || result.data == null || result.data.users == null || result.data.users.Count != users.Count)
        {
            await Clients.Clients(keys).SendAsync("RestartGameReceive");
            return;
        }

        foreach (var user in users)
        {
            var k = result.data.users.First(x=>x.userId == user.user.Id).userKey;
            var u = UserPlaying.GetInstance(user.user, _type, result.data.roomId, k);
            Playing.TryAdd(user.user.Id, u);
            await Clients.Client(user.connectionId).SendAsync("InitGameReceive", _type.GameUrl(result.data.roomId, k, user.user.Id));
        }

    }

}
public record HubUserGameRemove(string connectionId, UserView user);
public record HubUserGameResultItem(long userId, Guid userKey);
public record HubUserGameResult(Guid roomId, List<HubUserGameResultItem> users);