using Azure.Core;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.SignalR.Protocol;
using MizeBazi.Helper;
using MizeBazi.Models;
using MessagePack;
using System.Threading.Tasks;

namespace MizeBazi.HubControllers;

public class TestHub : Hub
{
    public TestHub()
    {

    }
    public override Task OnConnectedAsync()
    {
        string authHeader = "";
        string customHeader = "";

        var httpContext = Context.GetHttpContext();

        if (httpContext != null)
        {
            authHeader = httpContext.Request.Query["access_token"];
            customHeader = httpContext.Request.Headers["D-Id"];
        }

        //if (string.IsNullOrEmpty(authHeader) || string.IsNullOrEmpty(customHeader))
        //{
        //    Context.Abort();
        //    throw new HubException("Authorization header is missing.");
        //}


        return base.OnConnectedAsync();
    }
    public override Task OnDisconnectedAsync(Exception exception)
    {
        return base.OnDisconnectedAsync(exception);
    }

    public async Task Offer(string connectionId, string offer)
    {

        var httpContext = Context.GetHttpContext();
        if (httpContext != null)
        {
            var authHeader = httpContext.Request.Headers["Auth"];
        }
        await Clients.All.SendAsync("OfferReceive", offer);
    }

    public async Task Answer(string connectionId, string answer1, string answer2)
    {
        await Clients.Others.SendAsync("AnswerReceive", connectionId, answer1, answer2);
    }
    public async Task SendBinaryData(byte[] data)
    {
        await Clients.Others.SendAsync("ReceiveBinaryData", data);
    }
}
