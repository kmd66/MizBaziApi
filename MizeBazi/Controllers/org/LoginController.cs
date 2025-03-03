using Microsoft.AspNetCore.Mvc;
using MizeBazi.Helper;

namespace MizeBazi.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class LoginController : ControllerBase
    {
        readonly Service.LoginService _loginService;

        public LoginController()
        {
            _loginService = new Service.LoginService();
        }

        [HttpPost, Route("SendSecurityStamp")]
        public Task<Models.Result> SendSecurityStamp([FromBody] Models.SendSecurityStampDto model)
            => _loginService.SendSecurityStamp(model, HttpContext.Request.Headers["D-Id"].First());

        [HttpPost, Route("GetToken")]
        public Task<Models.Result<string>> GetToken([FromBody] Models.SendSecurityStampDto model)
            => _loginService.GetToken(model, HttpContext.Request.Headers["D-Id"].First());

    }
}
