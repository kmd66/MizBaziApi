using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using System.Linq;

namespace MizeBazi.HubControllers;

public class GroupHub : Hub
{
    static DateTime removeTime = DateTime.Now;
    static List<GroupMessageUser> listUser = new List<GroupMessageUser>();
    public static List<GroupMessage> listGroup = new List<GroupMessage>();

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var connectionId = Context.ConnectionId;
        var remove = listUser.Where(x => x.ConnectionId == connectionId).ToList();
        if (remove.Count > 0)
            remove.ForEach(r => listUser.Remove(r));

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
        var user = new GroupMessageUser(connectionId, key, userResult.data);
        listUser.Add(user);


        await Clients.Caller.SendAsync("InitReceive", key);
    }

    public async Task GetGroups(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Key == key && x.ConnectionId == connectionId);
        if (user == null)
            return;
        var groupMemberDataSource = new DataSource.GroupMemberDataSource();
        var groupsId = await groupMemberDataSource.ListGroupsId(user.User.Id);
        user.ListGroupId = groupsId.data;

        await Clients.Caller.SendAsync("GetGroupsReceive", true);
    }

    public async Task Join(Guid key, long groupId)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Key == key && x.ConnectionId == connectionId);
        if (user == null || !user.ListGroupId.Any(x => x == groupId))
            return;

        user.GroupId = groupId;

        var group = listGroup.FirstOrDefault(x => x.GroupId == groupId);
        if(group == null)
        {
            var groupDataSource = new DataSource.GroupDataSource();
            var result = await groupDataSource.Get(id: groupId);
            if (result.data == null)
                return;
            group = new GroupMessage(groupId, result.data);
            listGroup.Add(group);
        }

        await Clients.Caller.SendAsync("JoinReceive", group.Texts.ToJson(), group.PinText?.Text);
        removeGroups();
    }

    private void removeGroups()
    {
        if (DateTime.Now < removeTime)
            return;
        removeTime = DateTime.Now.AddHours(24);

        List<GroupMessage> removeItems = new List<GroupMessage>();
        foreach (var item in listGroup)
        {
            if (item.Texts.Last().Date < DateTime.Now.AddHours(-23) || item.PinText.Date < DateTime.Now.AddHours(-23))
                removeItems.Add(item);
        }
        foreach (var item in removeItems)
            listGroup.Remove(item);
    }

    public async Task Exit(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Key == key && x.ConnectionId == connectionId);
        if (user == null)
            return;
        user.GroupId = 0;
        await Clients.Caller.SendAsync("ExitReceive", true);
    }

    public async Task Destroy(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Key == key && x.ConnectionId == connectionId);
        if (user == null)
            return;

        var groupDataSource = new DataSource.GroupDataSource();
        var groupResult = await groupDataSource.Get(id: user.GroupId);
        if (groupResult == null)
            await Clients.Caller.SendAsync("DestroyReceive", user.GroupId);

        await groupDataSource.Remove(user.GroupId, user.User.Id);

        var listConnectionId = listUser.Where(x => x.GroupId == user.GroupId).Select(x => x.ConnectionId).ToList();

        await Clients.Clients(listConnectionId).SendAsync("DestroyReceive", user.GroupId);

        var group = listGroup.FirstOrDefault(x => x.GroupId == user.GroupId && x.View.CreateId == user.User.Id);
        if (group == null)
            listGroup.Remove(group);
    }

    public async Task Left(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Key == key && x.ConnectionId == connectionId);
        if (user == null)
            return;


        var dataSource = new DataSource.GroupMemberDataSource();
        var groupResult = await dataSource.Left(user.User.Id, user.GroupId);
        user.GroupId = 0;
        await Clients.Caller.SendAsync("DestroyReceive", user.GroupId);
    }

    public async Task Message(Guid key, string mes)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Key == key && x.ConnectionId == connectionId);
        if (user == null)
            return;

        var group = listGroup.FirstOrDefault(x => x.GroupId == user.GroupId);
        if (group != null)
        {
            var listConnectionId = listUser.Where(x => x.GroupId == user.GroupId).Select(x => x.ConnectionId).ToList();
            group.SetText(user.User, mes);
            await Clients.Clients(listConnectionId).SendAsync("MessageReceive", group.Texts.Last().ToJson());
        }
    }

    public async Task MessagePin(Guid key, string mes)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Key == key && x.ConnectionId == connectionId);
        if (user == null)
            return;

        var group = listGroup.FirstOrDefault(x => x.GroupId == user.GroupId && x.View.CreateId == user.User.Id);
        if (group != null)
        {
            var listConnectionId = listUser.Where(x => x.GroupId == user.GroupId).Select(x => x.ConnectionId).ToList();
            group.SetPinText(mes);
            await Clients.Clients(listConnectionId).SendAsync("MessagePinReceive", mes);
        }
    }

}

