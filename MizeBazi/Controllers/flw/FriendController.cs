using Microsoft.AspNetCore.Mvc;

namespace MizeBazi.Controllers
{
    public class FriendController : _ControllerBase
    {
        readonly Service.FriendService _service;

        public FriendController(Service.FriendService service)
        {
            _service = service;
        }

        [HttpPost, Route("Request")]
        public Task<Models.Result> Request(long userId)
            => _service.Request(userId);


        [HttpPost, Route("RequestEdit")]
        public Task<Models.Result> RequestEdit([FromBody] Models.RequestEdit model)
            => _service.RequestEdit(model);

        [HttpPost, Route("Block")]
        public Task<Models.Result> Block(long userId)
            => _service.Block(userId);

        [HttpPost, Route("RemoveFriend")]
        public Task<Models.Result> RemoveFriend(long userId)
            => _service.RemoveFriend(userId);

        [HttpPost, Route("RemoveBlock")]
        public Task<Models.Result> RemoveBlock(long userId)
            => _service.RemoveBlock(userId);

        [HttpPost, Route("List")]
        public Task<Models.Result<List<Models.UserView>>> List([FromBody] Models.FriendSearch model)
            => _service.List(model);

        [HttpPost, Route("ListRequest")]
        public Task<Models.Result<List<Models.UserView>>> ListRequest([FromBody] Models.FriendSearch model)
            => _service.ListRequest(model);

        [HttpPost, Route("ListBlock")]
        public Task<Models.Result<List<Models.UserView>>> ListBlock([FromBody] Models.FriendSearch model)
            => _service.ListBlock(model);

    }
}
