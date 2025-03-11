using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Models;

namespace MizeBazi.Controllers
{
    public class SvgController : Controller
    {
        private readonly IWebHostEnvironment _env;

        public SvgController(IWebHostEnvironment env)
        {
            _env = env;
        }
        public ActionResult Index()
        {
            string folderPath = Path.Combine(_env.WebRootPath, "icons");
            List<string> model = new List<string>();
            try
            {
                DirectoryInfo directoryInfo = new DirectoryInfo(folderPath);

               var files = directoryInfo.GetFiles("*.svg").ToList();

                model = files.Select(x=>x.Name.Replace(".svg", "")).ToList();
            }
            catch (Exception ex)
            {
            }

            return View($"~/Views/Svg.cshtml", model);
        }

    }
}
