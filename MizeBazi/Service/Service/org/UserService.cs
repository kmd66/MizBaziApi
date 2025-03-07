using MizeBazi.Helper;
using MizeBazi.Models;

namespace MizeBazi.Service;

public class UserService : IService
{
    //readonly DataSource.LoginDataSource _loginDataSource;
    readonly Helper.IRequestInfo _requestInfo;
    public UserService(IRequestInfo requestInfo)
    {
        _requestInfo = requestInfo;
    }

    public async Task<Result<UserDto>> Get()
    {
        var tokenDataSource = new DataSource.TokenDataSource();
        var tokenResult = await tokenDataSource.Get(_requestInfo.model.Id);
        if (tokenResult.Data == null || tokenResult.Data.Hash != _requestInfo.Token.Md5())
            return Result<UserDto>.Failure(code: 401, message: "401");

        var userDataSource = new DataSource.UserDataSource();
        var userResult = await userDataSource.Get(_requestInfo.model.UserId);
        if (userResult.Data == null)
            return Result<UserDto>.Failure(code: 401, message: "401");

        return Result<UserDto>.Successful(data: userResult.Data);
    }

    public async Task<Result> Edit(UserEdit model)
    {
        var validate = new UserValidate();
        validate.Edit(model);

        var userDataSource = new DataSource.UserDataSource();

        var userResult = await userDataSource.Get(_requestInfo.model.UserId);
        if (userResult.Data == null)
            return Result<UserDto>.Failure(code: 401, message: "401");

        if (string.IsNullOrEmpty(userResult.Data.UserName))
        {
            validate.EditUserName(model);
            var uniqueUserName = await userDataSource.UniqueUserName(model.UserName);
            if (!uniqueUserName.Success)
                return uniqueUserName;
        }

        await userDataSource.Edit(model, _requestInfo.model.UserId, string.IsNullOrEmpty(userResult.Data.UserName));

        return Result.Successful();
    }

    public async Task<Result> AddAvatar(IFormFile file, string contentType)
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

            var data = FileHelper.ResizeImageWithAspectRatio(fileData, AppStrings.AvatarMaxWidth, AppStrings.AvatarMaxHeigh);

            var userDataSource = new DataSource.UserDataSource();
            await userDataSource.AddAvatar(new UserThumbnail { Id = _requestInfo.model.UserId, img = data });
            return Result.Successful();

        }
        catch (Exception e)
        {
            return Result.Failure(message: e.Message);
        }
    }

    public async Task<Result<byte[]>> GetAvatar()
    {
        var userDataSource = new DataSource.UserDataSource();
        return await userDataSource.GetAvatar(_requestInfo.model.UserId);
    }
}

