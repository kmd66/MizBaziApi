using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace MizeBazi.HubControllers;

public class FriendHub : Hub
{
    static ConcurrentDictionary<long, UserHub> listUser = new ConcurrentDictionary<long, UserHub>();

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await base.OnDisconnectedAsync(exception);
    }

    public async Task Init(string auth, string dId)
    {
        var jwtModel = new JwtHelper().Decode(auth);
        if (jwtModel == null)
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }
        var tokenDataSource = new DataSource.TokenDataSource();
        var tokenResult = await tokenDataSource.Get(jwtModel.Id);
        if (jwtModel.DeviceId != dId
            || tokenResult.data == null
            || tokenResult.data.Hash != auth.Md5())
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }

        var userDataSource = new DataSource.UserDataSource();
        var userResult = await userDataSource.GetViwe(jwtModel.UserId);
        if (userResult.data == null)
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }

        var connectionId = Context.ConnectionId;

        var remove = listUser.Where(x => x.Key == userResult.data.Id).ToList();
        if (remove.Count > 0)
            remove.ForEach(r => listUser.TryRemove(r.Key, out _));

        var key = Guid.NewGuid();
        var user = new UserHub(key, connectionId, userResult.data);
        listUser.TryAdd(userResult.data.Id, user);

        await Clients.Caller.SendAsync("InitReceive", key, userResult.data.Id);
    }

    async Task ProcessMessageAsync(Message message)
    {
        await Task.Delay(5000);
    }
}

