using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Service;

namespace MizeBazi.Controllers
{
    public class LoginController : _ControllerBase
    {
        readonly Service.LoginService _service;

        public LoginController(Service.LoginService service)
        {
            _service = service;
        }

        [AllowAnonymous, HttpPost, Route("GetUser")]
        public Task<Models.Result> SendSecurityStamp([FromBody] Models.SendSecurityStampDto model)
            => _service.SendSecurityStamp(model);

        [AllowAnonymous, HttpPost, Route("GetToken")]
        public Task<Models.Result<string>> GetToken([FromBody] Models.SendSecurityStampDto model)
            => _service.GetToken(model);

    }
}
