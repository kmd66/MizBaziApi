using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Runtime.Intrinsics.X86;
using System.Threading;

namespace MizeBazi.DataSource;

public class FriendDataSource : BaseDataSource
{

    readonly FlwContexts _context;

    public FriendDataSource()
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
            var modelId = Guid.NewGuid();
            var model = new FriendRequest
            {
                Id = modelId,
                SenderID = from,
                ReceiverID = to,
                Type = FriendRequestType.در_انتظار
            };

            _context.Add<FriendRequest>(model);

            var notification = new Notification
            {
                Id = Guid.NewGuid(),
                RequestId= modelId,
                UserId = to,
                Type = NotificationType.درخواست_دوستی
            };
            _context.Add<Notification>(notification);

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
            var removeFriendRequests = await _context.FriendRequests.Where(x =>
                (x.SenderID == from && x.ReceiverID == to)
                || (x.SenderID == to && x.ReceiverID == from)
            ).ToListAsync();

            _context.FriendRequests.RemoveRange(removeFriendRequests);

            var removeFriend = await _context.Friends.Where(x =>
                (x.User1Id == from && x.User2Id == to)
                || (x.User1Id == to && x.User2Id == from)
            ).ToListAsync();

            _context.Friends.RemoveRange(removeFriend);

            var removeMessage= await _context.Messages.Where(x =>
                (x.SenderID == from && x.ReceiverID == to)
                || (x.SenderID == to && x.ReceiverID == from)
            ).ToListAsync();

            removeMessage.ForEach(x=>x.IsRemove = true);
            _context.UpdateRange(removeMessage);

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

    public async Task<Result> RemoveFriend(long from, long to)
    {
        try
        {
            var removeFriend = await _context.Friends.Where(x =>
                (x.User1Id == from && x.User2Id == to)
                || (x.User1Id == to && x.User2Id == from)
            ).ToListAsync();

            _context.Friends.RemoveRange(removeFriend);

            var removeMessage = await _context.Messages.Where(x =>
                (x.SenderID == from && x.ReceiverID == to)
                || (x.SenderID == to && x.ReceiverID == from)
            ).ToListAsync();

            removeMessage.ForEach(x => x.IsRemove = true);
            _context.UpdateRange(removeMessage);

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

    public async Task<Result<List<ListMember>>> List(long id, FriendSearch model)
    {
        try
        {
            var query = $"flw.ListFriend @UserId = {id.Query()}" +
                $", @UserName = {model.UserName.Query()}" +
                $", @Name = {model.Name.Query()}";

            var ett = await _context.ListMember.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<ListMember>>.Successful(data: ett);
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

    public async Task<Result<List<ListMember>>> ListRequest(long id, FriendSearch model)
    {
        try
        {
            var query = $"flw.ListRequest @UserId = {id.Query()}" +
                $", @UserName = {model.UserName.Query()}" +
                $", @Name = {model.Name.Query()}";

            var ett = await _context.ListMember.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<ListMember>>.Successful(data: ett);
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

    public async Task<Result<List<ListMember>>> ListBlock(long id, FriendSearch model)
    {
        try
        {
            var query = $"flw.ListBlock @UserId = {id.Query()}" +
                $", @UserName = {model.UserName.Query()}" +
                $", @Name = {model.Name.Query()}";

            var ett = await _context.ListMember.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<ListMember>>.Successful(data: ett);
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
}
