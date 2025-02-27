using Microsoft.AspNetCore.Mvc;
using MizeBazi.Helper;
using MizeBazi.Models;

namespace MizeBazi.Controllers
{
    [ApiController]
    [Route("api/v1/[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;

        public WeatherForecastController(ILogger<WeatherForecastController> logger)
        {
            _logger = logger;
        }

        [HttpGet(Name = "GetWeatherForecast")]
        public dynamic Get()
        {
            var jwtHelper = new JwtHelper();
            var t = jwtHelper.Code(Guid.NewGuid(),  165893213);
            return new
            {
                GetSecurityStamp = 5.GetSecurityStamp(),
                GetDigitsFromString = Guid.NewGuid().ToString().GetDigitsFromString(0, 5),
                Md5 = "testwwww".Md5(),
                Base64Encrypt = "testwwww".Base64Encrypt(),
                HashText = "testwwww".HashText(),
                SHA256 = "testwwww".SHA256(),

                AesE = t,
                AesD = jwtHelper.Decode(t),
            };
        }

        [HttpGet, Route("list")]
        public IEnumerable<WeatherForecast> GetWeatherForecast2(int id)
        {
            return Enumerable.Range(1, 5).Select(index => new WeatherForecast
            {
                Date = DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
                TemperatureC = Random.Shared.Next(-20, 55),
                Summary = Summaries[Random.Shared.Next(Summaries.Length)] + " : " + id
            })
            .ToArray();
        }
    }
}
