using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Collections.ObjectModel;

namespace MizeBazi.HubControllers;
public abstract class MainHub : Hub
{
    public abstract Task Init(string auth, string dId);
    protected abstract Task start();

    readonly JwtHelper _jwt;
    protected byte _count = 0;

    public MainHub(byte count)
    {
        _count = count;
        _jwt = new JwtHelper();
    }

    protected async Task _disconnected(Dictionary<string, UserView> initUser)
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
            initUser.Remove(connectionId);
            if (initUser.Count > 0)
               await Clients.All.SendAsync("InitReceive", UserView.SafeDictionary(initUser).ToJson());
        }

    }

    protected async Task _init(string auth, string dId, Dictionary<string, UserView> initUser)
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

        initUser.Add(connectionId, userResult.data);

        if (initUser.Count == _count)
            await start();
        else
           await Clients.All.SendAsync("InitReceive", UserView.SafeDictionary(initUser).ToJson());
    }


}
