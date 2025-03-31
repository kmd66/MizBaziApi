using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using System.Collections.Concurrent;
using static System.Runtime.InteropServices.JavaScript.JSType;

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

    public async Task InitMessage(Guid key, long userId)
    {
        var userSender = listUser.FirstOrDefault(x => x.Value.Key == key);
        if (userSender.Key == 0)
            return;

        if (!userSender.Value.Friends.Any(x => x == userId))
        {
            var isFriend = await new DataSource.FriendDataSource().IsFriend(userSender.Key, userId);
            if (!isFriend.data)
                return;

            var friend = await new DataSource.UserDataSource().GetViwe(userId);
            friend.data.SafeData();
            await Clients.Caller.SendAsync("InitMessageReceive", friend.data.ToJson());
            userSender.Value.Friends.Add(userId);
            return;
        }
        await Clients.Caller.SendAsync("InitMessageReceive", null);
    }

    public async Task AddMessage(Guid key, long userId, string msg, int index)
    {
        var userSender = listUser.FirstOrDefault(x => x.Value.Key == key);
        if (userSender.Key == 0)
            return;

        if (!userSender.Value.Friends.Any(x => x == userId))
            return;

        var addModel = addValidate(msg, userSender.Key, userId);
        if(addModel.Id == Guid.Empty)
        {
            await Clients.Caller.SendAsync("AddMessageReceive", addModel.Text, null, 0);
            return;
        }

        await Clients.Caller.SendAsync("AddMessageReceive", null, addModel.ToJson(), index);

        var dataSource = new DataSource.MessageDataSource();
        await dataSource.Add(addModel);

        var userReceiver = listUser.FirstOrDefault(x => x.Key == userId);

        if (userReceiver.Key != 0)
        {
            string friendData = "";
            if (!userReceiver.Value.Friends.Any(x => x == userSender.Key))
            {
                var friend = await new DataSource.UserDataSource().GetViwe(userSender.Key);
                userReceiver.Value.Friends.Add(userSender.Key);
                friend.data.SafeData();
                friendData = friend.data.ToJson();
            }
            await Clients.Client(userReceiver.Value.ConnectionId).SendAsync("TargetMessageReceive", friendData, addModel.ToJson());
        }
        else
        {
            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                RequestId = addModel.Id,
                UserId = userId,
                Type = NotificationType.پیام
            };
            await dataSource.AddNotification(notification);
        }

    }

    static Message addValidate(string text, long senderID, long receiverID)
    {

        var t = text.Replace(" ", "");
        if (string.IsNullOrEmpty(t))
            return new Message
            {
                Id = Guid.Empty,
                Text = "متن را وارد کنید",
            };
        if (text.Length > 110) text = text.Substring(0, 110);

        return new Message
        {
            Id = Guid.NewGuid(),
            IsRemove = false,
            Date = DateTime.Now,
            Text = text,
            ReceiverID  = receiverID,
            SenderID = senderID
        };
    }
}

