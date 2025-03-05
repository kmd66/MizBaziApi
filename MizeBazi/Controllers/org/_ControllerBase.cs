using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.DataSource;
using MizeBazi.Helper;

namespace MizeBazi.Controllers
{
    [Helper.Authorize, ApiController]
    [Route("api/v1/[controller]")]
    public class _ControllerBase : ControllerBase
    {
        //private readonly IRequestInfo _requestInfo;
        public _ControllerBase()
        {
            //_requestInfo = requestInfo;
        }
    }
}
