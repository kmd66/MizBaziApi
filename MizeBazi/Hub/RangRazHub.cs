using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using System.Collections.Concurrent;

namespace MizeBazi.HubControllers;

public class RangRazHub : MainHub
{
    static ConcurrentDictionary<string, UserView> initUser = new ConcurrentDictionary<string, UserView>();

    public RangRazHub() : base(GameType.رنگ_و_راز)
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
            initUser.TryRemove(key, out _);
        }
        await Clients.Clients(keys).SendAsync("InitGameReceive", _type.GameLink());
    }
}
