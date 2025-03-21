using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace MizeBazi.Controllers
{
    public class GroupController : _ControllerBase
    {
        readonly Service.UserService _service;

        public GroupController(Service.UserService service)
        {
            _service = service;
        }

        [HttpPost, Route("Add")]
        public Task<Models.Result<Models.UserDto>> Add()
            => _service.Get();

        [HttpPost, Route("Edit")]
        public Task<Models.Result> Edit([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("Get")]
        public Task<Models.Result> Get([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("List")]
        public Task<Models.Result> List([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("Search")]
        public Task<Models.Result> Search([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("JoinToGroup")] //Join To Group
        public Task<Models.Result> Join([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("Left")] // Left To Group
        public Task<Models.Result> Left([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost, Route("RemoveFromGroup")] //Remove From Group
        public Task<Models.Result> Remove([FromBody] Models.UserEdit model)
            => _service.Edit(model);

    }
}
