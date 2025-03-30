using System.Collections.Concurrent;

namespace MizeBazi.Models;

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
        Count = type.HubCount();
        Key = Guid.NewGuid();
        Date = DateTime.Now.AddMinutes(30);
        initUser = new ConcurrentDictionary<string, UserView>();
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
    public ConcurrentDictionary<string, UserView> initUser { get; set; }

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
