using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Models;

namespace MizeBazi.Controllers
{
    public class PagesController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        public ActionResult Home() => View();

        public ActionResult Help(byte? gameId)
        {
            switch (gameId)
            {
                case 25: return View($"~/Views/Pages/Help/{gameId}.cshtml");
                case 45: return View($"~/Views/Pages/Help/{gameId}.cshtml");
                case 68: return View($"~/Views/Pages/Help/{gameId}.cshtml");
                case 89: return View($"~/Views/Pages/Help/{gameId}.cshtml");
                default: return View("~/Views/Pages/Home.cshtml");
            }
        }

        public ActionResult Main(byte? gameId)
        {
            switch (gameId)
            {
                case 25: return View($"~/Views/Pages/Main/{gameId}.cshtml");
                case 45: return View($"~/Views/Pages/Main/{gameId}.cshtml");
                case 68: return View($"~/Views/Pages/Main/{gameId}.cshtml");
                case 89: return View($"~/Views/Pages/Main/{gameId}.cshtml");
                default: return View("~/Views/Pages/Home.cshtml");
            }
        }

        public ActionResult Group()=> View($"~/Views/Pages/Group/Index.cshtml");

        public ActionResult Friend()=> View($"~/Views/Pages/Friend/Index.cshtml");

        public ActionResult Room() => View("~/Views/Pages/Room/Room.cshtml");

        public ActionResult WheelFortune() => View("~/Views/Pages/WheelFortune.cshtml");


    }
}
