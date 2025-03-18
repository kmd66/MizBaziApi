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
    public RoomModel(Guid id, long createUserId, string createName, string name, string password, GameType type)
    {
        Id = id;

        CreateUserId = createUserId;
        CreateName = createName;
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
    public string CreateName { get; set; }
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
            createUserId = CreateUserId,
            createName = CreateName,
            name = Name,
            kay = Key,
            date = Date,
            count = Count,
            userCount = initUser.Count
        };

}

public class RoomHub : Hub
{
    static DateTime removeTime = DateTime.Now;
    static List<RoomModel> list = new List<RoomModel>();

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

            if (room.initUser.ContainsKey(connectionId))
            {
                await updateUser(false, connectionId, room, false);
            }
        }
        await base.OnDisconnectedAsync(exception);
    }

    public async Task Search(string name)
    {
        name = name.Replace(" ", "-");

        await removeInSearch();

        var model = list.Where(x => string.IsNullOrEmpty(name) || x.Name.Contains(name)).TakeLast(40)
            .Select(x => new {
                id = x.Id,
                name = x.Name.Replace("-", " "),
                createName = x.CreateName,
                type = x.Type,
                typeString = x.Type.EnumToString(),
                date = x.Date,
                count= x.initUser.Count
            }).ToList();
        await Clients.Caller.SendAsync("SearchReceive", model.ToJson());
    }

    async Task removeInSearch()
    {
        if (DateTime.Now < removeTime)
            return;
        removeTime = DateTime.Now.AddMinutes(2);

        var model = list.Where(x => x.Date < DateTime.Now).ToList();
        foreach (var item in model)
        {
            var keys = item.initUser.Keys.ToList();
            if (keys.Count > 0)
                await Clients.Clients(keys).SendAsync("DestroyReceive");
        }
        if (model.Count > 0)
            list = list.Where(x => x.Date > DateTime.Now).ToList();
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

        var userDataSource = new DataSource.UserDataSource();
        var userResult = await userDataSource.GetViwe(jwtModel.UserId);
        if (userResult.data == null)
        {
            Context.Abort();
            throw MizeBaziException_Hub.Error(message: "Authorization error ", code: 401);
        }

        // اصلاح
        //if (list.Any(x => x.CreateUserId == jwtModel.UserId))
        //{
        //    var f = list.First(x => x.CreateUserId == jwtModel.UserId);
        //    await Clients.Caller.SendAsync("CreateReceive", false,
        //        $"شما قبلا یک اتاق با نام {f.Name} برای {f.Type.EnumToString()} ایجاد کرده اید"
        //    );
        //    return;
        //}

        var createName = $"{userResult.data.FirstName} {userResult.data.LastName}";
        var id = Guid.NewGuid();
        RoomModel model = new RoomModel(id, jwtModel.UserId, createName, name, password, type);
        list.Add(model);
        await Clients.Caller.SendAsync("CreateReceive", true, model.SafeModel(true).ToJson());

        //throw new NotImplementedException();
    }

    public async Task Exit(Guid roomKey)
    {
        var connectionId = Context.ConnectionId;
        var room = list.FirstOrDefault(x => x.Key == roomKey);
        if (room != null)
        {
            if (room.initUser.ContainsKey(connectionId))
            {
                await Clients.Caller.SendAsync("ExitReceive");
                await updateUser(false, connectionId, room, false);
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
            await Clients.Caller.SendAsync("JoinReceive", false, "اتاقی وجود ندارد . ممکن است اعضای اتاق وارد بازی شده باشند", null, null);
            return;
        }

        if (room.Password != password)
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
        var room = list.FirstOrDefault(x => x.Id == id);

        if (room == null || room.initUser.Count >= room.Count)
        {
            await Clients.Caller.SendAsync("JoinReceive", false, "اتاقی وجود ندارد . ممکن است اعضای اتاق وارد بازی شده باشند", null, null);
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
            await updateUser(true, connectionId, room, room.CreateUserId == user.Id);

        }

    }

    private async Task start(RoomModel model)
    {
        var users = model.initUser.Values.ToList();
        var keys = model.initUser.Keys.ToList();
        list.Remove(model);
        await Clients.Clients(keys).SendAsync("InitGameReceive");
    }
    private async Task updateUser(bool join, string connectionId, RoomModel room, bool createUserId)
    {
        if (join)
        {
            var users = UserView.SafeDictionary(room.initUser);
            var imgs = room.initUser.Values.Select(x => x.Img).ToList();
            await Clients.Caller.SendAsync("JoinReceive", true, room.SafeModel(createUserId).ToJson(), users.ToJson(), imgs);
        }
        if (room.initUser.Count > 0)
        {
            var user = room.initUser[connectionId];
            var keys = room.initUser.Keys.Where(x => x != connectionId).ToList();
            if(!join)
                room.initUser.Remove(connectionId);
            await Clients.Clients(keys).SendAsync("UpdateReceive", join, connectionId, user.SafeModelwithoutImg().ToJson(), user.Img);
        }
    }

}

