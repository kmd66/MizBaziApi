//using Microsoft.AspNetCore.Authorization;
//using Microsoft.AspNetCore.Mvc;

//namespace MizeBazi.Controllers
//{
//    public class FriendController : _ControllerBase
//    {
//        readonly Service.FriendService _service;

//        public FriendController(Service.FriendService service)
//        {
//            _service = service;
//        }

//        [HttpPost, Route("Request")]
//        public Task<Models.Result> Request(long UserId)
//            => _service.Get();

//        [HttpPost, Route("List")]
//        public Task<Models.Result<byte[]>> List()
//            => _service.GetAvatar();

//        [HttpPost, Route("Search")]
//        public Task<Models.Result<byte[]>> Search(string UserName)
//            => _service.GetAvatar();


//        [HttpPost, Route("RequestList")]
//        public Task<Models.Result> RequestList()
//            => _service.Edit(model);

//        [HttpPost, Route("RequestListSearch")]
//        public Task<Models.Result<byte[]>> RequestListSearch(string UserName)
//            => _service.GetAvatar();


//        [HttpPost, Route("RequestEdit")]
//        public Task<Models.Result> RequestEdit([FromBody] Models.RequestEdit model)
//            => _service.Edit(model);


//        [HttpPost, Route("Block")]
//        public Task<Models.Result<byte[]>> Block(long UserId)
//            => _service.GetAvatar();

//        [HttpPost, Route("RemoveBlock")]
//        public Task<Models.Result<byte[]>> RemoveBlock(long UserId)
//            => _service.GetAvatar();

//        [HttpPost, Route("ListBlock")]
//        public Task<Models.Result<byte[]>> ListBlock(string UserName)
//            => _service.GetAvatar();

//    }
//}
