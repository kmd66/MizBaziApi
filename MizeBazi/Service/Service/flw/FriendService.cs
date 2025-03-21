using MizeBazi.Helper;
using MizeBazi.Models;
using System.IO;
using System.IO.Compression;

namespace MizeBazi.Service;

public class FriendService : IService
{
    //readonly DataSource.LoginDataSource _loginDataSource;
    readonly Helper.IRequestInfo _requestInfo;
    public FriendService(IRequestInfo requestInfo)
    {
        _requestInfo = requestInfo;
    }
}

