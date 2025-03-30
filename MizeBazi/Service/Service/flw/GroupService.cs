using MizeBazi.DataSource;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Runtime.Intrinsics.X86;
using Microsoft.AspNetCore.Mvc;

namespace MizeBazi.Service;

public class GroupService : IService
{
    readonly IRequestInfo _requestInfo;
    public GroupService(IRequestInfo requestInfo)
    {
        _requestInfo = requestInfo;
    }

    public async Task<Result> Add(GroupAdd model)
    {

        new GroupValidate().Add(model);

        var groupDataSource = new GroupDataSource();
        var isAdd = await groupDataSource.IsAdd(_requestInfo.model.UserId);
        if (isAdd.data)
            return Result.Failure(message: "شما قبلا یک گروه ایجاد کرده اید . بیش از یک گروه نمیتوانید ایجاد کنید");

        var list = await groupDataSource.Count(_requestInfo.model.UserId);
        if (list.data >= 5)
            return Result.Failure(message: "شما نمیتوانید عضو بیش از 5 گروه شوید");

        var group = await groupDataSource.Get(uniqueName: model.UniqueName);
        if (group.data != null)
            return Result.Failure(message: "گروه با این شناسه وجود دارد");

        var userDataSource = new UserDataSource();
        var userResult = await userDataSource.GetViwe(_requestInfo.model.UserId);

        var groupModel = new Group
        {
            CreateId = _requestInfo.model.UserId,
            UniqueName = model.UniqueName,
            Name = model.Name,
            Password = model.Password,
            Description = model.Description
        };

        var result = await groupDataSource.Add(groupModel);
        var groupMessage = new GroupMessage(result.data.Id, result.data);
        groupMessage.SetPinText("گروه ایجاد شد");

        HubControllers.GroupHub.listGroup.TryAdd(result.data.Id, groupMessage);

        return Result.Successful();
    }

    public async Task<Result> Edite(GroupEdit model)
    {
        new GroupValidate().Edite(model);

        var groupDataSource = new GroupDataSource();

        var group = await groupDataSource.Get(model.Id);
        if (group.data == null)
            return Result.Failure(message: "data null");
        if (group.data.CreateId != _requestInfo.model.UserId)
            return Result.Failure(message: "create null");

        return await groupDataSource.Edite(model);
    }

    public Task<Result<GroupView>> GetMyGroup()
        => new GroupDataSource().Get(createId: _requestInfo.model.UserId);

    public Task<Result<GroupView>> Get(long id, string uniqueName = null)
        => new GroupDataSource().Get(id: id, uniqueName: uniqueName);

    public Task<Result<List<GroupView>>> List()
        => new GroupDataSource().List(_requestInfo.model.UserId);

    public async Task<Result<List<GroupView>>> Search(string name)
    {
        if (string.IsNullOrEmpty(name) || name.Length < 3 || name.Length > 25)
            return Result<List<GroupView>>.Successful();

        var result = await new GroupDataSource().Search(name);

        if (result.data != null)
        {
            result.data.ForEach(x => x.SafeData());
        }

        return result;
    }

    public Task<Result> Remove(long id)
       => new GroupDataSource().Remove(id, _requestInfo.model.UserId);

    public async Task<Result> Join(GroupJoin model)
        {
        var groupDataSource = new GroupDataSource();
        var list = await groupDataSource.Count(_requestInfo.model.UserId);
        if(list.data>= 5)
            return Result.Failure(message: "شما نمیتوانید عضو بیش از 5 گروه شوید");

        var group = await groupDataSource.Get(model.Id);
        if(group.data == null)
            return Result.Failure(message: "data null");

        if(!string.IsNullOrEmpty(group.data.Password) && group.data.Password != model.Password)
            return Result.Failure(message: "رمز عبور اشتباه است");

        var dataSource = new GroupMemberDataSource();

        var blocked = await dataSource.IsBlocked(model.Id, _requestInfo.model.UserId);
        if (blocked.data)
            return Result.Failure(message: "شما توسط مدیر این گروه مسدود شده‌اید");

        var join = await dataSource.IsJoin(model.Id, _requestInfo.model.UserId);
        if (join.data)
            return Result.Failure(message: "شما عضو این گروه هستید");

        var groupMember = new GroupMember {
            GroupId = model.Id,
            UserId = _requestInfo.model.UserId
        };
        return await dataSource.Join(groupMember);
    }

    [HttpPost, Route("Left")] // Left From Group
    public Task<Models.Result> Left(long id)
        => new GroupMemberDataSource().Left(_requestInfo.model.UserId, id);
}

