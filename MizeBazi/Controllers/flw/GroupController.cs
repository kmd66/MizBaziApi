using Microsoft.AspNetCore.Mvc;

namespace MizeBazi.Controllers
{
    public class GroupController : _ControllerBase
    {
        readonly Service.GroupService _service;

        public GroupController(Service.GroupService service)
        {
            _service = service;
        }

        [HttpPost, Route("Add")]
        public Task<Models.Result> Add([FromBody] Models.GroupAdd model)
            => _service.Add(model);

        [HttpPost, Route("Edit")]
        public Task<Models.Result> Edite([FromBody] Models.GroupEdit model)
            => _service.Edite(model);

        [HttpPost, Route("Get")]
        public Task<Models.Result<Models.GroupView>> Get(long id)
            => _service.Get(id);

        [HttpPost, Route("List")]
        public Task<Models.Result<List<Models.GroupView>>> List()
            => _service.List();

        [HttpPost, Route("Search")]
        public Task<Models.Result<List<Models.GroupView>>> Search(string name)
            => _service.Search(name);

        [HttpPost, Route("Join")] //Join From Group
        public Task<Models.Result> Join(Models.GroupJoin model)
            => _service.Join(model);

        [HttpPost, Route("Left")] // Left From Group
        public Task<Models.Result> Left(long id)
            => _service.Left(id);

        [HttpPost, Route("Remove")] //Remove Group
        public Task<Models.Result> Remove(long id)
            => _service.Remove(id);

    }
}
