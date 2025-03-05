using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Models;

namespace MizeBazi.Controllers
{
    public class HomeController : Controller
    {
        public static string WebWersion = "1.1.0";
        
        public ActionResult Index()
        {
            return View();
        }


        [HttpPost, Route("api/CheckHost")]
        public Result<CheckHost> Get()
        {
            return Result<CheckHost>.Successful(data: new CheckHost { WebWersion = WebWersion });
        }

    }
}
