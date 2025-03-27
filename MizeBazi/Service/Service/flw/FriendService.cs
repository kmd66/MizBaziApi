using MizeBazi.DataSource;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Runtime.Intrinsics.X86;

namespace MizeBazi.Service;

public class FriendService : IService
{
    readonly IRequestInfo _requestInfo;
    public FriendService(IRequestInfo requestInfo)
    {
        _requestInfo = requestInfo;
    }

    public async Task<Result> Request(long userId)
    {
        var userDataSource = new UserDataSource();
        var userResult = await userDataSource.Get(userId);
        if (userResult.data == null)
            return Result.Failure(message: "user null");

        var friendDataSource = new FriendDataSource();

        var friend = await friendDataSource.IsFriend(userId, _requestInfo.model.UserId);
        if (friend.data)
            return Result.Failure(message: "کاربر قبلا درخواست شمار را قبول کرده است");

        var block1 = await friendDataSource.IsBlock(userId, _requestInfo.model.UserId);
        if (block1.data)
            return Result.Failure(message: "کاربر شمار را مسدود کرده است");

        var block2 = await friendDataSource.IsBlock(_requestInfo.model.UserId, userId);
        if (block2.data)
            return Result.Failure(message: "شما کاربر را مسدود کرده اید");

        var request1 = await friendDataSource.IsRequest(_requestInfo.model.UserId, userId);
        if (request1.data)
            return Result.Failure(message: "درخواست قبلا ثبت شده است");

        var request2 = await friendDataSource.IsRequest(userId, _requestInfo.model.UserId);
        if (request2.data)
            return await friendDataSource.AddFriend(userId, _requestInfo.model.UserId);

        return await friendDataSource.AddRequest(_requestInfo.model.UserId, userId);
    }

    public async Task<Result> RequestEdit(RequestEdit model)
    {
        if(model.Type == RequestEditType.Unknown)
            return Result.Failure(message: "type null");

        var friendDataSource = new FriendDataSource();

        var isRequest = await friendDataSource.IsRequest(model.UserId, _requestInfo.model.UserId);
        if(!isRequest.data)
            return Result.Failure(message: "user null");

        if (model.Type == RequestEditType.مسدود_کردن)
            return await friendDataSource.AddBlock(model.UserId, _requestInfo.model.UserId);


        if (model.Type == RequestEditType.قبول_کردن)
            return await friendDataSource.AddFriend(model.UserId, _requestInfo.model.UserId);

        return await friendDataSource.RemoveRequest(model.UserId, _requestInfo.model.UserId);
    }

    public Task<Result> Block(long userId)
        => new FriendDataSource().AddBlock(_requestInfo.model.UserId, userId);

    public Task<Result> RemoveFriend(long userId)
        => new FriendDataSource().RemoveFriend(_requestInfo.model.UserId, userId);

    public Task<Result> RemoveBlock(long userId)
        => new FriendDataSource().RemoveBlock(_requestInfo.model.UserId, userId);

    public Task<Result<List<UserView>>> List(FriendSearch model)
        => new FriendDataSource().List(_requestInfo.model.UserId, model);

    public Task<Result<List<UserView>>> ListRequest(FriendSearch model)
        => new FriendDataSource().ListRequest(_requestInfo.model.UserId, model);

    public Task<Result<List<UserView>>> ListBlock(FriendSearch model)
        => new FriendDataSource().ListBlock(_requestInfo.model.UserId, model);
}

