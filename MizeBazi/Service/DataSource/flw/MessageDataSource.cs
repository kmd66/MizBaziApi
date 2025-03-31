using Microsoft.EntityFrameworkCore;
using MizeBazi.Models;
using MizeBazi.Helper;

namespace MizeBazi.DataSource;

public class MessageDataSource : BaseDataSource
{

    readonly FlwContexts _context;

    public MessageDataSource()
    {
        _context = new FlwContexts();
    }


    public async Task<Result> Add(Message model)
    {
        try
        {
            //var ett = await _context.Friends.Where(x =>
            //    (x.User1Id == model.SenderID && x.User2Id == model.ReceiverID)
            //    || (x.User1Id == model.ReceiverID && x.User2Id == model.SenderID)
            //).AsNoTracking().Take(1).FirstOrDefaultAsync();
           
            //if(ett == null)
            //    return Result.Failure(message : "User null");

            _context.Add<Message>(model);
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

    public async Task<Result> Remove(long from, long to)
    {
        try
        {
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

    public async Task<Result<List<MessageVeiw>>> List(long userId)
    {
        try
        {
            var query = $"flw.ListMessage @UserId = {userId.Query()}";

            var ett = await _context.MessageVeiws.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<MessageVeiw>>.Successful(data: ett);
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

    public async Task<Result<List<MessageVeiw>>> ListForRoom(long User1Id, long User2Id)
    {
        try
        {
            var query = $"flw.ListMessageRoom @User1Id = {User1Id.Query()}, @User2Id = {User2Id.Query()}";

            var ett = await _context.MessageVeiws.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<MessageVeiw>>.Successful(data: ett);
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

    public async Task<Result<List<NotificationVeiw>>> ListNotification(long userId)
    {
        try
        {
            var query = $"flw.ListNotification @UserId = {userId.Query()}";

            var ett = await _context.NotificationVeiws.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<NotificationVeiw>>.Successful(data: ett);
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

    public async Task<Result> AddNotification(Notification model)
    {
        try
        {
            _context.Add<Notification>(model);

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
}
