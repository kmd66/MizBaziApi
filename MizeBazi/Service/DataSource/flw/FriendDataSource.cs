using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Threading;

namespace MizeBazi.DataSource;

public class FriendDataSource : BaseDataSource
{

    readonly FlwContexts _orgContexts;

    public FriendDataSource()
    {
        _orgContexts = new FlwContexts();
    }
}
