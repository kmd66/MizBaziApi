using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;

namespace MizeBazi.HubControllers;

public class AfsonVajehHub : MainHub
{
    public static byte Count = 8;
    static Dictionary<string, UserView> initUser = new Dictionary<string, UserView>();
    public AfsonVajehHub() : base(Count)
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
        var users = initUser.Values.Take(Count).ToList();
        var keys = initUser.Keys.Take(Count).ToList();
        foreach (var key in keys)
        {
            initUser.Remove(key);
        }
        await Clients.Clients(keys).SendAsync("InitGameReceive");
    }
}
