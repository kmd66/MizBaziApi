using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MizeBazi.Controllers
{
    public class MessageController : _ControllerBase
    {
        readonly Service.UserService _service;

        public MessageController(Service.UserService service)
        {
            _service = service;
        }

        [HttpPost, Route("Add")]
        public Task<Models.Result<Models.UserDto>> Add()
            => _service.Get();

        [HttpPost, Route("Edit")]
        public Task<Models.Result> Edit([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("List")]
        public Task<Models.Result> List([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("ListForRoom")]
        public Task<Models.Result> ListForRoom([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("Remove")]
        public Task<Models.Result<byte[]>> Remove()
            => _service.GetAvatar();

    }
}
