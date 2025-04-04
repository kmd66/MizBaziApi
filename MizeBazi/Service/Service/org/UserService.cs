﻿using MizeBazi.Helper;
using MizeBazi.Models;

namespace MizeBazi.Service;

public class UserService : IService
{
    readonly Helper.IRequestInfo _requestInfo;
    public UserService(IRequestInfo requestInfo)
    {
        _requestInfo = requestInfo;
    }

    public async Task<Result<UserDto>> Get()
    {
        var tokenDataSource = new DataSource.TokenDataSource();
        var tokenResult = await tokenDataSource.Get(_requestInfo.model.Id);
        if (tokenResult.data == null || tokenResult.data.Hash != _requestInfo.Token.Md5())
            return Result<UserDto>.Failure(code: 401, message: "401");

        var userDataSource = new DataSource.UserDataSource();
        var userResult = await userDataSource.Get(_requestInfo.model.UserId);
        if (userResult.data == null)
            return Result<UserDto>.Failure(code: 401, message: "401");

        return Result<UserDto>.Successful(data: userResult.data);
    }

    public async Task<Result> Edit(UserEdit model)
    {
        var validate = new UserValidate();
        validate.Edit(model);

        var userDataSource = new DataSource.UserDataSource();

        var userResult = await userDataSource.Get(_requestInfo.model.UserId);
        if (userResult.data == null)
            return Result<UserDto>.Failure(code: 401, message: "401");

        if (string.IsNullOrEmpty(userResult.data.UserName))
        {
            validate.EditUserName(model);
            var uniqueUserName = await userDataSource.UniqueUserName(model.UserName);
            if (!uniqueUserName.success)
                return uniqueUserName;
        }

        await userDataSource.Edit(model, _requestInfo.model.UserId, string.IsNullOrEmpty(userResult.data.UserName));

        return Result.Successful();
    }

    public async Task<Result> AddAvatar(IFormFile file, string folderPath, string contentType)
    {
        try
        {
            if (file.Length > AppStrings.AvatarSize)
                return Result.Failure(message: "حجم فایل بزرگتر از حد مجاز است");

            MemoryStream target = new MemoryStream();
            file.CopyTo(target);
            var fileData = target.ToArray();

            if (!FileHelper.Validate(file.FileName, contentType, fileData,
                FileExtensions.jpeg
                | FileExtensions.jpg
                //| FileExtensions.png
                ))
                return Result.Failure(message: "مجاز به آپلود این نوع فایل نیستید");

            var data90 = FileHelper.ResizeImageWithAspectRatio(fileData, 90);
            var data400 = FileHelper.ResizeImageWithAspectRatio(fileData, 400);
            var imgName = $"/thumbnail/{Guid.NewGuid().Stamp()}";
            File.WriteAllBytes($"{folderPath}{imgName}90.jpg", data90);
            File.WriteAllBytes($"{folderPath}{imgName}400.jpg", data400);

            var userDataSource = new DataSource.UserDataSource();
            await userDataSource.AddAvatar(_requestInfo.model.UserId, imgName);
            return Result.Successful();

        }
        catch (Exception e)
        {
            return Result.Failure(message: e.Message);
        }
    }

    public async Task<Result<string>> GetAvatar()
    {
        var userDataSource = new DataSource.UserDataSource();
        return await userDataSource.GetAvatar(_requestInfo.model.UserId);
    }

    public async Task<Result<UserView>> GetViwe(long id = 0)
    {
        if (id == 0)
        {
            var tokenDataSource = new DataSource.TokenDataSource();
            var tokenResult = await tokenDataSource.Get(_requestInfo.model.Id);
            if (tokenResult.data == null || tokenResult.data.Hash != _requestInfo.Token.Md5())
                return Result<UserView>.Failure(code: 401, message: "401");
        }

        var userDataSource = new DataSource.UserDataSource();
        var result = await userDataSource.GetViwe(id == 0 ? _requestInfo.model.UserId : id);
        if (id == 0 && result.data == null)
        {
            return Result<UserView>.Failure(code: 401, message: "401");
        }
        if (!result.success)
            return Result<UserView>.Failure(message: result.message);
        if (result.data != null && id != 0)
            result.data.SafeData();
        return Result<UserView>.Successful(data: result.data);
    }

    public async Task<Result<List<UserView>>> ListViweById(List<long> ids)
    {
        var userDataSource = new DataSource.UserDataSource();

        var result = await userDataSource.ListViweById(ids);
        if (!result.success)
            return Result<List<UserView>>.Failure(message: result.message);
        foreach(var obj in result.data)
            obj.SafeData();
        return Result<List<UserView>>.Successful(data: result.data);
    }
}

