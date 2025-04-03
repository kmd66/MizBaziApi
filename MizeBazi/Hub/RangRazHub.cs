using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using System.Collections.Concurrent;
using System.Security.Cryptography;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;

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
        await _start(initUser);
    }
}
