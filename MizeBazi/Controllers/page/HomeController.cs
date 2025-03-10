using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Models;

namespace MizeBazi.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        //[Helper.Authorize]
        [HttpPost, Route("api/CheckHost")]
        public Result<CheckHost> Get()
        {
            return Result<CheckHost>.Successful(data: new CheckHost ());
        }

    }
}
