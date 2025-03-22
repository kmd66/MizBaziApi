using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Runtime.Intrinsics.X86;
using System.Threading;

namespace MizeBazi.DataSource;

public class GroupDataSource : BaseDataSource
{

    readonly FlwContexts _context;

    public GroupDataSource()
    {
        _context = new FlwContexts();
    }

    public async Task<Result> AddFriend(long from, long to)
    {
        try
        {
            var ett = await _context.FriendRequests.Where(x =>
                (x.SenderID == from && x.ReceiverID == to)
                || (x.SenderID == to && x.ReceiverID == from)
            ).AsNoTracking().ToListAsync(); 
            
            _context.FriendRequests.RemoveRange(ett);

            var model = new Friend
            {
                Id = Guid.NewGuid(),
                User1Id = from,
                User2Id = to,
            };
            _context.Add<Friend>(model);
            await _context.SaveChangesAsync();

            return Result.Successful();
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<Result<bool>> IsFriend(long user1, long user2)
    {
        try
        {
            var ett = await _context.Friends.Where(x =>
                (x.User1Id == user1 && x.User2Id == user2)
                || (x.User1Id == user2 && x.User2Id == user1)
            ).AsNoTracking().Take(1).FirstOrDefaultAsync();

            return Result<bool>.Successful(data: ett != null);
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<Result> AddRequest(long from, long to)
    {
        try
        {
            var model = new FriendRequest
            {
                Id = Guid.NewGuid(),
                SenderID = from,
                ReceiverID = to,
                Type = FriendRequestType.در_انتظار
            };

            _context.Add<FriendRequest>(model);
            await _context.SaveChangesAsync();

            return Result.Successful();
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<Result<bool>> IsRequest(long from, long to)
    {
        try
        {
            var ett = await _context.FriendRequests.Where(x =>
            x.SenderID == from && x.ReceiverID == to && x.Type == FriendRequestType.در_انتظار
            ).AsNoTracking().Take(1).FirstOrDefaultAsync();

            return Result<bool>.Successful(data: ett != null);
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<Result> RemoveRequest(long from, long to)
    {
        try
        {
            var ett = await _context.FriendRequests.Where(x =>
                (x.SenderID == from && x.ReceiverID == to)
                || (x.SenderID == to && x.ReceiverID == from)
            ).AsNoTracking().ToListAsync();

            _context.FriendRequests.RemoveRange(ett);
            await _context.SaveChangesAsync();

            return Result<bool>.Successful(data: ett != null);
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {

            _context.ChangeTracker.Clear();
        }
    }

    public async Task<Result<bool>> IsBlock(long userBlocker, long userBlocked)
    {
        try
        {
            var ett = await _context.BlockFriends.Where(x =>
                x.User1Id == userBlocker && x.User2Id == userBlocked
            ).AsNoTracking().Take(1).FirstOrDefaultAsync();

            return Result<bool>.Successful(data: ett != null);
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }
    public async Task<Result> AddBlock(long from, long to)
    {
        try
        {
            var ett = await _context.FriendRequests.Where(x =>
                (x.SenderID == from && x.ReceiverID == to)
                || (x.SenderID == to && x.ReceiverID == from)
            ).AsNoTracking().ToListAsync();

            _context.FriendRequests.RemoveRange(ett);

            var ett2 = await _context.Friends.Where(x =>
                (x.User1Id == from && x.User2Id == to)
                || (x.User1Id == to && x.User2Id == from)
            ).AsNoTracking().ToListAsync();

            _context.Friends.RemoveRange(ett2);

            var model = new BlockFriend
            {
                Id = Guid.NewGuid(),
                User1Id = from,
                User2Id = to,
            };
            _context.Add<BlockFriend>(model);
            await _context.SaveChangesAsync();

            return Result.Successful();
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<Result> RemoveBlock(long from, long to)
    {
        try
        {
            var ett = await _context.BlockFriends.Where(x =>
                x.User1Id == from && x.User2Id == to
            ).AsNoTracking().ToListAsync();

            _context.BlockFriends.RemoveRange(ett);
            await _context.SaveChangesAsync();

            return Result.Successful();
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            _context.ChangeTracker.Clear();
        }
    }

    public async Task<Result<List<UserView>>> List(long id, FriendSearch model)
    {
        var contexts = new OrgContexts();
        try
        {
            var query = $"flw.ListFriend @@UserId = {id.Query()}" +
                $", @UserName = {model.UserName.Query()}" +
                $", @FirstName = {model.FirstName.Query()}" +
                $", @LastName = {model.LastName.Query()}";

            var ett = await contexts.UsersView.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<UserView>>.Successful(data: ett);
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            contexts.ChangeTracker.Clear();
        }
    }

    public async Task<Result<List<UserView>>> ListRequest(long id, FriendSearch model)
    {
        var contexts = new OrgContexts();
        try
        {
            var query = $"flw.ListRequest @@UserId = {id.Query()}" +
                $", @UserName = {model.UserName.Query()}" +
                $", @FirstName = {model.FirstName.Query()}" +
                $", @LastName = {model.LastName.Query()}";

            var ett = await contexts.UsersView.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<UserView>>.Successful(data: ett);
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            contexts.ChangeTracker.Clear();
        }
    }

    public async Task<Result<List<UserView>>> ListBlock(long id, FriendSearch model)
    {
        var contexts = new OrgContexts();
        try
        {
            var query = $"flw.ListBlock @@UserId = {id.Query()}" +
                $", @UserName = {model.UserName.Query()}" +
                $", @FirstName = {model.FirstName.Query()}" +
                $", @LastName = {model.LastName.Query()}";

            var ett = await contexts.UsersView.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<UserView>>.Successful(data: ett);
        }
        catch (Exception ex)
        {
            throw MizeBaziException.Error(message: ex.Message);
        }
        finally
        {
            contexts.ChangeTracker.Clear();
        }
    }
}
