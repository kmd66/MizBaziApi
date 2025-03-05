using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MizeBazi.Controllers
{
    public class UserController : _ControllerBase
    {
        readonly Service.UserService _service;

        public UserController(Service.UserService service)
        {
            _service = service;
        }

        [HttpPost, Route("Get")]
        public Task<Models.Result<Models.UserDto>> Get()
            => _service.Get();

        [HttpPost, Route("Edit")]
        public Task<Models.Result> Edit([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("GetAvatar")]
        public Task<Models.Result<byte[]>> GetAvatar()
            => _service.GetAvatar();

    }
}
