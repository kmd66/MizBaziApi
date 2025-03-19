using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;

namespace MizeBazi.HubControllers;

public class MafiaHub : MainHub
{
    static Dictionary<string, UserView> initUser = new Dictionary<string, UserView>();
    public MafiaHub() : base(GameType.مافیا)
    {
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        await _disconnected(initUser);
        await base.OnDisconnectedAsync(exception);
    }
    public override async Task Init(string auth, string dId)
    {
        await _init(auth, dId, initUser);
    }

    protected override async Task start()
    {
        var users = initUser.Values.Take(_count).ToList();
        var keys = initUser.Keys.Take(_count).ToList();
        foreach (var key in keys)
        {
            initUser.Remove(key);
        }
        await Clients.Clients(keys).SendAsync("InitGameReceive", _type.GameLink());
    }
}
