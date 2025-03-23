using MizeBazi.Models;
using System.Security.Claims;

namespace MizeBazi.Helper;

public interface IRequestInfo
{
    public Jwt model { get; }
    public string DeviceId { get;}
    public string Token { get; }

}

public class RequestInfo : IRequestInfo
{

    private readonly IHttpContextAccessor _httpContextAccessor;

    public RequestInfo(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
        if (_httpContextAccessor.HttpContext?.Request != null && _httpContextAccessor.HttpContext.Request.Headers.ContainsKey("Auth"))
        {
            Token = _httpContextAccessor.HttpContext.Request.Headers["Auth"];
            model = new JwtHelper().Decode(_httpContextAccessor.HttpContext.Request.Headers["Auth"]);
        }
        if (_httpContextAccessor.HttpContext?.Request != null && _httpContextAccessor.HttpContext.Request.Headers.ContainsKey("D-Id"))
            DeviceId = _httpContextAccessor.HttpContext.Request.Headers["D-Id"];
    }

    private RequestInfo()
    {
    }

    public static RequestInfo Instance(string token, string deviceId )
    {
        var requestInfo = new RequestInfo();
        requestInfo.Token = token;
        requestInfo.DeviceId = deviceId;
        requestInfo.model = new JwtHelper().Decode(token);
        return requestInfo;
    }

    public Jwt model { get; private set; }
    public string DeviceId { get; private set; }
    public string Token { get; private set; }

}
