using MizeBazi.Models;

namespace MizeBazi.Helper;

public class JwtHelper
{

    public string Code(Guid id ,long userId, string deviceId)
    {
        var model = new Jwt
        {
            Id = id,
            Date = DateTime.Now,
            Expiry = DateTime.Now.AddMonths(AppStrings.AccessTokenTime),
            UserId = userId,
            DeviceId = deviceId
        };
        return code(model);

    }
    public string Code(long userId, string deviceId)
    {
        var model = new Jwt
        {
            Id = Guid.NewGuid(),
            Date = DateTime.Now,
            Expiry = DateTime.Now.AddMonths(AppStrings.AccessTokenTime),
            UserId = userId,
            DeviceId = deviceId
        };
        return code(model);

    }
    private string code(Jwt model)
    {
        string jsonString = System.Text.Json.JsonSerializer.Serialize(model);
        return jsonString.AesEncrypt(AppStrings.JwtKey, AppStrings.JwtIv);
    }

    public Jwt Decode(string token){
        try
        {

            var model = System.Text.Json.JsonSerializer.Deserialize<Jwt>(token.AesDecrypt(AppStrings.JwtKey, AppStrings.JwtIv));
            return model;
         }
        catch
        {
            return null;
        }
    }

}