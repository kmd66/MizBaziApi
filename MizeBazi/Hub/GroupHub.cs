using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System.Collections.Concurrent;

namespace MizeBazi.HubControllers;

public class GroupHub : Hub
{
    static DateTime removeTime = DateTime.Now;
    static ConcurrentDictionary<long, GroupMessageUser> listUser = new ConcurrentDictionary<long, GroupMessageUser>();
    public static ConcurrentDictionary<long, GroupMessage> listGroup = new ConcurrentDictionary<long, GroupMessage>();

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var connectionId = Context.ConnectionId;
        var remove = listUser.FirstOrDefault(x => x.Value.ConnectionId == connectionId);
        if (remove.Key != 0)
            listUser.TryRemove(remove.Key, out _);

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
        var user = new GroupMessageUser(connectionId, key, userResult.data);
        listUser.TryAdd(userResult.data.Id, user);


        await Clients.Caller.SendAsync("InitReceive", key, userResult.data.UserName);
    }

    public async Task GetGroups(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
            return;
        var groupMemberDataSource = new DataSource.GroupMemberDataSource();
        var groupsId = await groupMemberDataSource.ListGroupsId(user.Value.User.Id);
        user.Value.ListGroupId = groupsId.data;

        await Clients.Caller.SendAsync("GetGroupsReceive", true);
    }

    public async Task Join(Guid key, long groupId)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0 || !user.Value.ListGroupId.Any(x => x == groupId))
            return;

        user.Value.GroupId = groupId;

        var group = listGroup.FirstOrDefault(x => x.Value.GroupId == groupId);
        if(group.Key ==0)
        {
            var groupDataSource = new DataSource.GroupDataSource();
            var result = await groupDataSource.Get(id: groupId);
            if (result.data == null)
                return;
            var addModel = new GroupMessage(groupId, result.data);
            listGroup.TryAdd(result.data.Id, addModel);
            group = listGroup.FirstOrDefault(x => x.Value.GroupId == groupId);
        }

        await Clients.Caller.SendAsync("JoinReceive", group.Value.Texts.ToJson(), group.Value.PinText?.Text);
        removeGroups();
    }

    private void removeGroups()
    {
        if (DateTime.Now < removeTime)
            return;
        removeTime = DateTime.Now.AddHours(24);

        List<long> removeItems = new List<long>();
        foreach (var item in listGroup)
        {
            if (item.Value.Texts.Last().Date < DateTime.Now.AddHours(-23) || item.Value.PinText.Date < DateTime.Now.AddHours(-23))
                removeItems.Add(item.Key);
        }
        foreach (var item in removeItems)
            listGroup.TryRemove(item, out _);
    }

    public async Task Exit(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
            return;
        user.Value.GroupId = 0;
        await Clients.Caller.SendAsync("ExitReceive", true);
    }

    public async Task Destroy(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
            return;

        var groupDataSource = new DataSource.GroupDataSource();
        var groupResult = await groupDataSource.Get(id: user.Value.GroupId);
        if (groupResult == null)
            await Clients.Caller.SendAsync("DestroyReceive", user.Value.GroupId);

        await groupDataSource.Remove(user.Value.GroupId, user.Value.User.Id);

        var listConnectionId = listUser.Where(x => x.Value.GroupId == user.Value.GroupId).Select(x => x.Value.ConnectionId).ToList();

        await Clients.Clients(listConnectionId).SendAsync("DestroyReceive", user.Value.GroupId);

        var group = listGroup.FirstOrDefault(x => x.Value.GroupId == user.Value.GroupId && x.Value.View.CreateId == user.Value.User.Id);
        if (group.Key == 0)
            listGroup.TryRemove(group.Key, out _);
    }

    public async Task Left(Guid key)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
            return;


        var dataSource = new DataSource.GroupMemberDataSource();
        var groupResult = await dataSource.Left(user.Value.User.Id, user.Value.GroupId);
        user.Value.GroupId = 0;
        await Clients.Caller.SendAsync("DestroyReceive", user.Value.GroupId);
    }

    public async Task Message(Guid key, string mes)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
            return;

        var group = listGroup.FirstOrDefault(x => x.Value.GroupId == user.Value.GroupId);
        if (group.Key != 0 && user.Value.GroupId == group.Key)
        {
            var listConnectionId = listUser.Where(x => x.Value.GroupId == user.Value.GroupId).Select(x => x.Value.ConnectionId).ToList();
            group.Value.SetText(user.Value.User, mes);
            await Clients.Clients(listConnectionId).SendAsync("MessageReceive", group.Value.Texts.Last().ToJson());
        }
    }

    public async Task MessagePin(Guid key, string mes)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
            return;

        var group = listGroup.FirstOrDefault(x => x.Value.GroupId == user.Value.GroupId && x.Value.View.CreateId == user.Value.User.Id);
        if (group.Key != 0)
        {
            var listConnectionId = listUser.Where(x => x.Value.GroupId == user.Value.GroupId).Select(x => x.Value.ConnectionId).ToList();
            group.Value.SetPinText(mes);
            await Clients.Clients(listConnectionId).SendAsync("MessagePinReceive", mes);
        }
    }

    public async Task ListUserFromGroup(Guid key, bool blocked, string userName, string name)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
            return;
        var dataSource = new DataSource.GroupMemberDataSource();
        var result = await dataSource.List(user.Value.GroupId, blocked, userName, name);

        await Clients.Caller.SendAsync("ListUserFromGroupReceive", blocked, result.data.ToJson());
    }

    public async Task RemoveFromGroup(Guid key, long userId)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
        {
            await Clients.Caller.SendAsync("RemoveFromGroupReceive", false, userId);
            return;
        }

        var group = listGroup.FirstOrDefault(x => x.Value.GroupId == user.Value.GroupId);
        if (group.Key == 0 || group.Value.View.CreateId != user.Value.User.Id)
            return;
        if (group.Value.View.CreateId == userId)
        {
            await Clients.Caller.SendAsync("RemoveFromGroupReceive", false, userId);
            return;
        }


        var dataSource = new DataSource.GroupMemberDataSource();
        await dataSource.RemoveFromGroup(userId, user.Value.GroupId);

        var removeUser = listUser.FirstOrDefault(x => x.Key == userId);
        if (removeUser.Key != 0)
        {
            await Clients.Client(removeUser.Value.ConnectionId).SendAsync("targetRemoveReceive", group.Key, group.Value.View.Name);
            removeUser.Value.GroupId = 0;
            removeUser.Value.ListGroupId.Remove(group.Key);
        }


        await Clients.Caller.SendAsync("RemoveFromGroupReceive", true, userId);
    }

    public async Task AddBlock(Guid key, long userId)
    {
        var connectionId = Context.ConnectionId;
        var user = listUser.FirstOrDefault(x => x.Value.Key == key && x.Value.ConnectionId == connectionId);
        if (user.Key == 0)
        {
            await Clients.Caller.SendAsync("AddBlockReceive", false, userId);
            return;
        }

        var group = listGroup.FirstOrDefault(x => x.Value.GroupId == user.Value.GroupId);
        if (group.Key == 0 || group.Value.View.CreateId != user.Value.User.Id)
            return;
        if (group.Value.View.CreateId == userId)
        {
            await Clients.Caller.SendAsync("AddBlockReceive", false, userId);
            return;
        }

        var dataSource = new DataSource.GroupMemberDataSource();
        await dataSource.AddBlock(userId, user.Value.GroupId);

        var removeUser = listUser.FirstOrDefault(x => x.Key == userId);
        if (removeUser.Key != 0)
        {
            await Clients.Client(removeUser.Value.ConnectionId).SendAsync("targetRemoveReceive", group.Key, group.Value.View.Name);
            removeUser.Value.GroupId = 0;
            removeUser.Value.ListGroupId.Remove(group.Key);
        }

        await Clients.Caller.SendAsync("AddBlockReceive", true, userId);
    }
}

