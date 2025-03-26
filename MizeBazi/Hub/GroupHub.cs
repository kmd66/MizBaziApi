using Microsoft.AspNetCore.SignalR;
using MizeBazi.Models;
using MizeBazi.Helper;
using Microsoft.AspNetCore.Http.HttpResults;
using System.Text.RegularExpressions;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory.Database;
using System.Linq;

namespace MizeBazi.HubControllers;

public class GroupHub : Hub
{
    static DateTime removeTime = DateTime.Now;
    static List<GroupMessageUser> listUser = new List<GroupMessageUser>();
    static List<GroupMessage> listGroup = new List<GroupMessage>();

    public override async Task OnDisconnectedAsync(Exception exception)
    {
        var connectionId = Context.ConnectionId;
        var remove = listUser.Where(x => x.ConnectionId == connectionId).FirstOrDefault();
        
        await base.OnDisconnectedAsync(exception);
    }

    public async Task Exit(Guid id, Guid roomKey)
    {
        var connectionId = Context.ConnectionId;
    }

    public async Task Destroy(string auth, string dId, string name)
    {
        var connectionId = Context.ConnectionId;
    }

    public async Task Message(Guid id, Guid roomKey, string mes)
    {
    }

    public async Task Join(string auth, string dId, Guid roomId, string password)
    {
    }

    private async Task init(Guid id, string connectionId, UserView user)
    {
    }

}

