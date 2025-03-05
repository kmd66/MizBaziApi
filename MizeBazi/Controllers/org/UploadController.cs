using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using MizeBazi.Helper;
using MizeBazi.Models;
using MizeBazi.Service;

namespace MizeBazi.Controllers
{
    public class UploadController : _ControllerBase
    {
        public UploadController()
        {
        }

        [HttpPost, Route("Avatar")]
        public async Task<Result> Avatar(UserService userService)
        {
            var filelist = Request.Form.Files;

            try
            {
                if (filelist.Count > 0)
                {
                    var file = filelist[0];
                    await userService.AddAvatar(file);
                }
                return Result.Successful();

            }
            catch (Exception e)
            {
                return Result.Failure(message: e.Message);
            }

        }
    }
}
