using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using System.Linq;

namespace MizeBazi.HubControllers;

public class RoomModel
{
    public RoomModel(Guid id, long createUserId, string name, string password, GameType type)
    {
        Id = id;

        CreateUserId = createUserId;
        Name = name;
        Password = password;
        Type = type;
        switch (type)
        {
            case GameType.نبرد_خنده: Count = NabardKhandeHub.Count; break;
            case GameType.رنگ_و_راز: Count = RangRazHub.Count; break;
            case GameType.آفسون_واژه: Count = AfsonVajehHub.Count; break;
            case GameType.مافیا: Count = MafiaHub.Count; break;
        }

        Key = Guid.NewGuid();
        Date = DateTime.Now.AddMinutes(30);
        initUser = new Dictionary<string, UserView>();
    }

    public Guid Id { get; set; }
    public long CreateUserId { get; set; }
    public string Name { get; set; }
    public string Password { get; set; }
    public GameType Type { get; private set; }
    public byte Count { get; private set; }

    public Guid Key { get; set; }
    public DateTime Date { get; private set; }
    public Dictionary<string, UserView> initUser { get; set; }

    public object SafeModel(bool create = false)
        => new
        {
            creator = create,
            id = Id,
            CreateUserId = Id,
            name = Name,
            kay = Key,
            date = Date,
        };

}

public class RoomHub : Hub
{
    static List<RoomModel> list = new List<RoomModel>();

    public async Task Search(string name)
    {
        name = name.Replace(" ", "-");

        await removeInSearch();

        var model = list.Where(x => string.IsNullOrEmpty(name) || x.Name.Contains(name)).TakeLast(50)
            .Select(x => new {
                id = x.Id,
                name = x.Name.Replace("-", " "),
                type = x.Type,
                typeString = x.Type.EnumToString(),
                date = x.Date.ToString(),
            }).ToList();
        await Clients.Caller.SendAsync("SearchReceive", list.Count, model.ToJson());
    }

    async Task removeInSearch()
    {
        var model = list.Where(x => x.Date < DateTime.Now).ToList();
        foreach (var item in model)
        {
            var keys = item.initUser.Keys.ToList();
            if (keys.Count > 0)
                await Clients.Clients(keys).SendAsync("DestroyReceive");
        }
    }
    
    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var connectionId = Context.ConnectionId;
        foreach(var room in list)
        {
            //var keyToRemove = initUser.Where(x => x.Value.Id == initUser[connectionId].Id).Select(x => x.Key).ToList();
            // اصلاح
            //foreach (var key in keyToRemove)
            //{
            //    initUser.Remove(key);
            //}

            if (room.initUser.ContainsKey(connectionId))
            {
                room.initUser.Remove(connectionId);
                await updateUser(room);
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task Exit(Guid roomKey)
    {
        var connectionId = Context.ConnectionId;
        var room = list.FirstOrDefault(x => x.Key == roomKey);
        if (room != null)
        {
            if (room.initUser.ContainsKey(connectionId))
            {
                room.initUser.Remove(connectionId);
                await updateUser(room);
            }
        }
    }

    public async Task Create(string auth, string dId, string name, string password, GameType type)
    {

        name = name.Replace(" ", "-");


        if (string.IsNullOrEmpty(password) || password.Length < 3 || password.Length > 25)
        {
            await Clients.Caller.SendAsync("CreateReceive", false, "پسورد را صحیح وارد کنید");
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

        if (list.Any(x => x.Name == name && x.Type == type))
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

        if (list.Any(x => x.CreateUserId == jwtModel.UserId))
        {
            var f = list.First(x => x.CreateUserId == jwtModel.UserId);
            await Clients.Caller.SendAsync("CreateReceive", false,
                $"شما قبلا یک اتاق با نام {f.Name} برای {f.Type.EnumToString()} ایجاد کرده اید"
            );
            return;
        }

        var id = Guid.NewGuid();
        RoomModel model = new RoomModel(id, jwtModel.UserId, name, password, type);
        list.Add(model);
        await Clients.Caller.SendAsync("CreateReceive", true, model.SafeModel(true).ToJson());

        throw new NotImplementedException();
    }

    public async Task Destroy(string auth, string dId, string name)
    {
        var model = new JwtHelper().Decode(auth);
        if (model == null)
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }
        if (list.Any(x => x.CreateUserId == model.UserId))
        {
            var item = list.First(x => x.CreateUserId == model.UserId);
            var keys = item.initUser.Keys.ToList();
            if (keys.Count > 0)
                await Clients.Clients(keys).SendAsync("DestroyReceive");
        }
    }

    public async Task Message(Guid roomKey, long userId, string mes)
    {
        if (mes.Length > 0&& mes.Length < 200)
        {
            var room = list.FirstOrDefault(x => x.Key == roomKey);
            if (room != null)
            {
                var keys = room.initUser.Keys.ToList();
                await Clients.Clients(keys).SendAsync("MessageReceive", userId, mes);
            }
        }
    }

    public async Task Join(string auth, string dId, Guid roomId, string password)
    {

        var room = list.FirstOrDefault(x => x.Id == roomId);
        if (room == null)
        {
            await Clients.Caller.SendAsync("JoinReceive", false, "اتاقی وجود ندارد . ممکن است اعضای اتاق وارد بازی شده باشند");
            return;
        }

        if (room.Password != password)
        {
            await Clients.Caller.SendAsync("JoinReceive", false, "رمز عبور اشتباه است");
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
        var room = list.FirstOrDefault(x => x.Id == id);

        if (room == null || room.initUser.Count >= room.Count)
        {
            await Clients.Caller.SendAsync("JoinReceive", false, "اتاقی وجود ندارد . ممکن است اعضای اتاق وارد بازی شده باشند");
            return;
        }

        foreach (var t in room.initUser)
        {
            // اصلاح
            //if (t.Value.Id == user.Id)
            //    return;
        }

        room.initUser.Add(connectionId, user);

        if (room.initUser.Count == room.Count)
        {
            await start(room);
        }
        else
        {
            await updateUser(room);
            await Clients.Clients(connectionId).SendAsync("JoinReceive", user.Id, room.SafeModel(room.CreateUserId == user.Id).ToJson());

        }

    }

    private async Task start(RoomModel model)
    {
        var users = model.initUser.Values.ToList();
        var keys = model.initUser.Keys.ToList();
        list.Remove(model);
        await Clients.Clients(keys).SendAsync("InitGameReceive");
    }
    private async Task updateUser(RoomModel room)
    {
        if (room.initUser.Count > 0)
        {
            var keys = room.initUser.Keys.ToList();
            var users = room.initUser.Values.Select(x => x.SafeModelwithoutImg());
            var imgs = room.initUser.Values.Select(x => x.Img);
            await Clients.Clients(keys).SendAsync("UpdateReceive", true, users.ToJson(), imgs);
        }
    }

}

