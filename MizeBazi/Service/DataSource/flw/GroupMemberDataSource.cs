using Microsoft.EntityFrameworkCore;
using MizeBazi.Models;

namespace MizeBazi.DataSource;

public class GroupMemberDataSource : BaseDataSource
{

    readonly FlwContexts _context;

    public GroupMemberDataSource()
    {
        _context = new FlwContexts();
    }


    public async Task<Result> Join(GroupMember model)
    {
        try
        {
            _context.Add<GroupMember>(model);
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

    public async Task<Result> Left(long userId, long id)
    {
        try
        {
            var ett = await _context.GroupMembers.Where(x =>
                x.UserId == userId && x.GroupId == id
            ).AsNoTracking().FirstOrDefaultAsync();

            if (ett != null)
            {

                var group = await _context.Groups.Where(x =>
                    x.Id == id
                ).AsNoTracking().FirstOrDefaultAsync();
                if (group != null && group.CreateId == userId)
                {
                    var groupMembers = await _context.GroupMembers.Where(x =>
                        x.GroupId == group.Id
                    ).AsNoTracking().ToListAsync();

                    _context.Groups.Remove(group);
                    _context.GroupMembers.RemoveRange(groupMembers);
                }
                else
                {

                    _context.GroupMembers.Remove(ett);
                }
                await _context.SaveChangesAsync();
            }
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

    public async Task<Result<bool>> IsJoin(long id, long userId)
    {
        try
        {
            var ett = await _context.GroupMembers.Where(x =>
                x.GroupId == id && x.UserId == userId
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
}
