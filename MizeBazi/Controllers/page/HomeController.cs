using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Models;

namespace MizeBazi.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
            => View();

        public ActionResult WheelFortune()
            => View();

        public ActionResult Room()
            => View("~/Views/Pages/Room/Room.cshtml");

        //[Helper.Authorize]
        [HttpPost, Route("api/CheckHost")]
        public Result<CheckHost> Get()
            => Result<CheckHost>.Successful(data: new CheckHost());
        
        [HttpGet, Route("api/getCheckHost")]
        public Result<CheckHost> GetCheckHost()
            => Result<CheckHost>.Successful(data: new CheckHost());

    }
}
