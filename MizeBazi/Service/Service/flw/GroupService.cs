﻿using MizeBazi.DataSource;
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


        var group = await groupDataSource.Get(0, model.UniqueName);
        if (group.data != null)
            return Result.Failure(message: "گروه با این شناسه وجود دارد");

        var groupModel = new Group
        {
            CreateId = _requestInfo.model.UserId,
            UniqueName = model.UniqueName,
            Name = model.Name,
            Password = model.Password,
            Description = model.Description
        };
        return await groupDataSource.Add(groupModel);
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

    public Task<Result<GroupView>> Get(long id, string uniqueName = null)
        => new GroupDataSource().Get(id, uniqueName);

    public Task<Result<List<GroupView>>> List()
       => new GroupDataSource().List(_requestInfo.model.UserId);

    public async Task<Result<List<GroupView>>> Search(string name)
    {
        if (string.IsNullOrEmpty(name) || name.Length < 3 || name.Length > 25)
            return Result<List<GroupView>>.Successful();

        return await new GroupDataSource().Search(name);
    }

    public Task<Result> Remove(long id)
       => new GroupDataSource().Remove(id, _requestInfo.model.UserId);

    public async Task<Result> Join(GroupJoin model)
    {
        var groupDataSource = new GroupDataSource();
        var list = await groupDataSource.List(_requestInfo.model.UserId);
        if(list.data.Count >= 5)
            return Result.Failure(message: "شما نمیتوانید عضو بیش از 5 گروه شوید");

        var group = await groupDataSource.Get(model.Id);
        if(group.data == null)
            return Result.Failure(message: "data null");

        if(!string.IsNullOrEmpty(group.data.Password) && group.data.Password != model.Password)
            return Result.Failure(message: "رمز عبور اشتباه است");

        var groupMember = new GroupMember {
            GroupId = model.Id,
            UserId = _requestInfo.model.UserId
        };
        var dataSource = new GroupMemberDataSource();
        return await dataSource.Join(groupMember);
    }

    [HttpPost, Route("Left")] // Left From Group
    public Task<Models.Result> Left(long id)
        => new GroupMemberDataSource().Left(_requestInfo.model.UserId, id);
}

