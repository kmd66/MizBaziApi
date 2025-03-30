using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using System.Text.RegularExpressions;
using System.Collections.Concurrent;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using System.Collections.Generic;

namespace MizeBazi.HubControllers;

public class RoomHub : Hub
{
    static DateTime removeTime = DateTime.Now;
    static ConcurrentDictionary<long, RoomModel> list = new ConcurrentDictionary<long, RoomModel>();

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var connectionId = Context.ConnectionId;
        foreach (var room in list)
        {
            //var keyToRemove = initUser.Where(x => x.Value.Id == initUser[connectionId].Id).Select(x => x.Key).ToList();
            // اصلاح
            //foreach (var key in keyToRemove)
            //{
            //    initUser.Remove(key);
            //}

            if (room.Value.initUser.ContainsKey(connectionId))
            {
                await updateUser(false, connectionId, room.Value, false);
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task Search(string name)
    {
        name = name.Replace(" ", "-");

        await removeInSearch();

        var model = list.Where(x => string.IsNullOrEmpty(name) || x.Value.Name.Contains(name)).TakeLast(40)
            .Select(x => new {
                id = x.Value.Id,
                name = x.Value.Name.Replace("-", " "),
                createName = x.Value.CreateName,
                type = x.Value.Type,
                typeString = x.Value.Type.EnumToString(),
                date = x.Value.Date,
                count= x.Value.initUser.Count
            }).ToList();
        await Clients.Caller.SendAsync("SearchReceive", model.ToJson());
    }

    async Task removeInSearch()
    {
        if (DateTime.Now < removeTime)
            return;
        removeTime = DateTime.Now.AddMinutes(2);

        var model = list.Where(x => x.Value.Date < DateTime.Now).ToList();
        foreach (var item in model)
        {
            var keys = item.Value.initUser.Keys.ToList();
            if (keys.Count > 0)
                await Clients.Clients(keys).SendAsync("DestroyReceive");
        }
        if (model.Count > 0)
        {
            var filter = list.Where(x => x.Value.Date >= DateTime.Now);
            list = new ConcurrentDictionary<long, RoomModel>(filter);
        }
    }

    public async Task Create(string auth, string dId, string name, string password, GameType type)
        {

       name = name.Replace(" ", "-");

        if (type == GameType.Unknown)
        {
            await Clients.Caller.SendAsync("CreateReceive", false, "نوع انتخاب نشده");
            return;
        }

        if (string.IsNullOrEmpty(password) || password.Length < 3 || password.Length > 25)
        {
            await Clients.Caller.SendAsync("CreateReceive", false, "رمز عبور را صحیح وارد کنید");
            return;
        }

        if (!Regex.IsMatch(password, @"^[a-zA-Z0-9]+$"))
        {
            await Clients.Caller.SendAsync("CreateReceive", false, " رمز عبور باید از اعداد و حروف لاتین باشد");
            return;
        }

        if (string.IsNullOrEmpty(name) || name.Length < 3 || name.Length > 25)
        {
            await Clients.Caller.SendAsync("CreateReceive", false, "نام را صحیح وارد کنید");
            return;
        }

        if (list.Any(x => x.Value.Name == name && x.Value.Type == type))
        {
            await Clients.Caller.SendAsync("CreateReceive", false, "یک اتاق با این نام وجود دارد");
            return;
        }
        var jwtModel = new JwtHelper().Decode(auth);
        if (jwtModel == null)
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
        list.TryGetValue(userResult.data.Id, out RoomModel roomCheck);

        if (roomCheck != null)
        {
            await Clients.Caller.SendAsync("CreateReceive", false,
                $"شما قبلا یک اتاق با نام {roomCheck.Name} برای {roomCheck.Type.EnumToString()} ایجاد کرده اید"
            );
            return;
        }

        var createName = $"{userResult.data.FirstName} {userResult.data.LastName}";
        var id = Guid.NewGuid();
        RoomModel model = new RoomModel(id, jwtModel.UserId, createName, name, password, type);
        list.TryAdd(userResult.data.Id, model);
        await Clients.Caller.SendAsync("CreateReceive", true, model.SafeModel(true).ToJson());

        //throw new NotImplementedException();
    }

    public async Task Exit(Guid id, Guid roomKey)
    {
        var connectionId = Context.ConnectionId;
        var room = list.FirstOrDefault(x => x.Value.Id == id);
        if (room.Key != 0 && room.Value.Key == roomKey)
        {
            if (room.Value.initUser.ContainsKey(connectionId))
            {
                await Clients.Caller.SendAsync("ExitReceive");
                await updateUser(false, connectionId, room.Value, false);
            }
        }
    }

    public async Task Destroy(string auth, string dId, string name)
    {
        var model = new JwtHelper().Decode(auth);
        if (model == null)
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }
        if (list.Any(x => x.Value.CreateUserId == model.UserId))
        {
            var items = list.Where(x => x.Value.CreateUserId == model.UserId).ToList();
            foreach(var item in items)
            {
                var keys = item.Value.initUser.Keys.ToList();
                if (keys.Count > 0)
                    await Clients.Clients(keys).SendAsync("DestroyReceive");
            }

            var filter = list.Where(x => x.Value.CreateUserId != model.UserId);
            list = new ConcurrentDictionary<long, RoomModel>(filter);
        }
    }

    public async Task Message(Guid id, Guid roomKey, string mes)
    {
        if (mes.Length > 0 && mes.Length < 200)
        {
            var room = list.FirstOrDefault(x => x.Value.Id == id);
            if (room.Key !=0 && room.Value.Key == roomKey)
            {
                var keys = room.Value.initUser.Keys.ToList();
                await Clients.Clients(keys).SendAsync("MessageReceive", Context.ConnectionId, mes);
            }
        }
    }

    public async Task Join(string auth, string dId, Guid roomId, string password)
    {
        var room = list.FirstOrDefault(x => x.Value.Id == roomId);
        if (room.Key == 0)
        {
            await Clients.Caller.SendAsync("JoinReceive", false, "اتاقی وجود ندارد . ممکن است اعضای اتاق وارد بازی شده باشند", null, null);
            return;
        }

        if (room.Value.Password != password)
        {
            await Clients.Caller.SendAsync("JoinReceive", false, "رمز عبور اشتباه است", null, null);
            return;
        }

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

        await init(roomId, connectionId, userResult.data);
    }

    private async Task init(Guid id, string connectionId, UserView user)
    {
        var room = list.FirstOrDefault(x => x.Value.Id == id);

        if (room.Key == 0 || room.Value.initUser.Count >= room.Value.Count)
        {
            await Clients.Caller.SendAsync("JoinReceive", false, "اتاقی وجود ندارد . ممکن است اعضای اتاق وارد بازی شده باشند", null, null);
            return;
        }

        foreach (var t in room.Value.initUser)
        {
            // اصلاح
            //if (t.Value.Id == user.Id)
            //    return;
        }

        room.Value.initUser.TryAdd(connectionId, user);

        if (room.Value.initUser.Count == room.Value.Count)
        {
            await start(room.Key);
        }
        else
        {
            await updateUser(true, connectionId, room.Value, room.Value.CreateUserId == user.Id);

        }

    }

    private async Task start(long modelId)
    {
        list.TryGetValue(modelId, out RoomModel model);
        var users = model.initUser.Values.ToList();
        var keys = model.initUser.Keys.ToList();
        list.TryRemove(modelId, out _);
        await Clients.Clients(keys).SendAsync("InitGameReceive");
    }

    private async Task updateUser(bool join, string connectionId, RoomModel room, bool createUserId)
    {
        if (join)
        {
            var users = UserView.SafeDictionary(room.initUser);
            await Clients.Caller.SendAsync("JoinReceive", true, room.SafeModel(createUserId).ToJson(), users.ToJson());
        }
        if (room.initUser.Count > 0)
        {
            var user = room.initUser[connectionId];
            var keys = room.initUser.Keys.Where(x => x != connectionId).ToList();
            if(!join)
                room.initUser.TryRemove(connectionId, out _);
            await Clients.Clients(keys).SendAsync("UpdateReceive", join, connectionId, user.SafeModelwithoutBio().ToJson());
        }
    }

}

