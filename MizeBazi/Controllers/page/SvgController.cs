//using Microsoft.AspNetCore.Http;
//using Microsoft.AspNetCore.Mvc;
//using MizeBazi.Models;
//using System.Text;

//namespace MizeBazi.Controllers
//{
//    public class SvgController : Controller
//    {
//        private readonly IWebHostEnvironment _env;

//        public SvgController(IWebHostEnvironment env)
//        {
//            _env = env;
//        }
//        public ActionResult Index()
//        {
//            webMtoBase64();

//            string folderPath = Path.Combine(_env.WebRootPath, "icons");
//            List<string> model = new List<string>();
//            try
//            {
//                DirectoryInfo directoryInfo = new DirectoryInfo(folderPath);

//                var files = directoryInfo.GetFiles("*.svg").ToList();

//                model = files.Select(x => x.Name.Replace(".svg", "")).ToList();
//            }
//            catch (Exception ex)
//            {
//            }

//            return View($"~/Views/Svg.cshtml", model);
//        }

//        private void webMtoBase64()
//        {
//            string videoDirectory = @"D:\mizbazi\MizeBaziApi\MizeBaziStream\src\wwwUrl\sticker";

//            string[] videoExtensions = { ".webm", ".avi", ".mov", ".wmv", ".mkv" };

//            try
//            {
//                StringBuilder sb = new StringBuilder();
//                sb.Append("const stickerDATA = {");
//                var videoFiles = Directory.GetFiles(videoDirectory)
//                    .Where(file => videoExtensions.Contains(Path.GetExtension(file).ToLower()));
//                //data:video/mp4;base64,
//                foreach (var videoFile in videoFiles)
//                {
//                    string name = Path.GetFileNameWithoutExtension(videoFile);
//                    sb.Append($"'{name}':'{ConvertVideoToBase64(videoFile)}',");
//                }

//                sb.Append("}");
//                System.IO.File.WriteAllText(@"D:\mizbazi\MizeBaziApi\MizeBaziStream\src\wwwUrl\sticker\t.js", sb.ToString());
//            }
//            catch (Exception ex)
//            {
//                Console.WriteLine($"خطا: {ex.Message}");
//            }
//        }
//        static string ConvertVideoToBase64(string filePath)
//        {
//            byte[] videoBytes = System.IO.File.ReadAllBytes(filePath);
//            return Convert.ToBase64String(videoBytes);
//        }


//    }
//}
