using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace MizeBazi.HubControllers;

public class FriendHub : Hub
{

    public static List<UserHub> listUser = new List<UserHub>();

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

        var remove = listUser.Where(x => x.User.Id == userResult.data.Id).ToList();
        if (remove.Count > 0)
            remove.ForEach(r => listUser.Remove(r));

        var key = Guid.NewGuid();
        var user = new UserHub(key, connectionId, userResult.data);

        await Clients.Caller.SendAsync("InitReceive", key);
    }
}

