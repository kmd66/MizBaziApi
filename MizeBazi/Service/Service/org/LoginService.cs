﻿using MizeBazi.Helper;
using MizeBazi.Models;

namespace MizeBazi.Service;

public class LoginService : IService
{
    //readonly DataSource.LoginDataSource _loginDataSource;
    readonly Helper.IRequestInfo _requestInfo;
    public LoginService(IRequestInfo requestInfo)
    {
        _requestInfo = requestInfo;
    }

    public async Task<Result> SendSecurityStamp(SendSecurityStampDto model)
    {

        new UserValidate().SendSecurityStamp(model);

        var deviceModel = new DeviceDto(Guid.NewGuid(), _requestInfo.DeviceId, model.Phone, DateTime.Now);
        await new DeviceValidate().SendSecurityStamp(deviceModel);

        await new SecurityStampValidate().SendSecurityStamp(model.Phone);

        var userDataSource = new DataSource.UserDataSource();
        var userResult = await userDataSource.GetByPhone(model.Phone);

        if (userResult.Data == null)
        {
            var addModel = new UserRegister(UnicId: Guid.NewGuid(), Phone: model.Phone);
            await userDataSource.Add(addModel);
        }

        var SecurityStampModel = new SecurityStampDto(Guid.NewGuid(), model.Phone, Helper.Hash.GetDigitsFromGuid(), 0, DateTime.Now);

        var SecurityStamDataSource = new DataSource.SecurityStampDataSource();
        await SecurityStamDataSource.Add(SecurityStampModel);

        return Result.Successful();
    }

    public async Task<Result<string>> GetToken(SendSecurityStampDto model)
    {
        new UserValidate().SendSecurityStamp(model);

        var securityStamDataSource = new DataSource.SecurityStampDataSource();
        var result = await securityStamDataSource.GetLast(model.Phone);

        if (result.Data == null || result.Data.Count > 3)
            return Result<string>.Failure(message: "محدودیت در بررسی otp. دوباره درخاست ارسال پیامک دهید");

        if (result.Data.Date.AddSeconds(125) < DateTime.Now)
            return Result<string>.Failure(message: "کد ارسالی منقضی شده است. دوباره درخاست ارسال پیامک دهید");

        if (result.Data.Stamp != model.Stamp)
            return Result<string>.Failure(message: "کد ارسالی صحیح نمیباشد");

        var userDataSource = new DataSource.UserDataSource();
        var userResult = await userDataSource.GetByPhone(model.Phone);

        if (userResult.Data == null)
            return Result<string>.Failure(message: "user null");

        var tokenId = Guid.NewGuid();

        var tokenDataSource = new DataSource.TokenDataSource();
        await tokenDataSource.RemoveAllToken(userResult.Data.Id);

        var jwtHelper = new JwtHelper();
        var token = jwtHelper.Code(tokenId, userResult.Data.Id, _requestInfo.DeviceId);
        var tokenModel = new TokenDto(tokenId, userResult.Data.Id, token.Md5(), true);

        await tokenDataSource.Add(tokenModel);
        await securityStamDataSource.Expiry(result.Data.Id);

        var deviceDataSource = new DataSource.DeviceDataSource();
        var deviceModel = new DeviceDto(Guid.NewGuid(), _requestInfo.DeviceId, model.Phone, DateTime.Now);
        await deviceDataSource.Add(deviceModel);

        return Result<string>.Successful(data: token);
    }
}

