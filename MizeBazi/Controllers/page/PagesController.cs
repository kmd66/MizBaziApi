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

        public ActionResult Main25() => View();

        public ActionResult Main45() => View();

        public ActionResult Main68() => View();

        public ActionResult Main89() => View();


    }
}
