﻿using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using System.Collections.Concurrent;

namespace MizeBazi.HubControllers;

public class AfsonVajehHub : MainHub
{
    static ConcurrentDictionary<string, UserView> initUser = new ConcurrentDictionary<string, UserView>();
    public AfsonVajehHub() : base(GameType.افسون_واژه)
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
