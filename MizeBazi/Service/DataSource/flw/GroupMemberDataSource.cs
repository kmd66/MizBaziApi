using Microsoft.EntityFrameworkCore;
using MizeBazi.Helper;
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
                x.UserId == userId && x.GroupId == id && x.blocked == false
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

    public async Task<Result<List<long>>> ListGroupsId(long userId)
    {
        try
        {
            var ett = await _context.GroupMembers.Where(x =>
                x.UserId == userId && x.blocked == false
            ).AsNoTracking().Select(x=>x.GroupId).ToListAsync();

            return Result<List<long>>.Successful(data: ett);
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

    public async Task<Result<List<ListGroupMember>>> List(long groupId, bool blocked, string userName, string name)
    {
        try
        {
            var query = $"flw.ListGroupMembers @GroupId = {groupId.Query()}," +
                $" @Blocked = {blocked.Query()}," +
                $" @UserName = {userName.Query()}," +
                $" @Name = {name.Query()}";

            var ett = await _context.ListGroupMember.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<ListGroupMember>>.Successful(data: ett);
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

    public async Task<Result> RemoveFromGroup(long userId, long groupId)
    {
        try
        {
            var ett = await _context.GroupMembers.Where(x =>
                x.UserId == userId && x.GroupId == groupId  // && x.blocked == true
            ).AsNoTracking().FirstOrDefaultAsync();

            if (ett != null)
            {
                _context.GroupMembers.Remove(ett);
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

    public async Task<Result<bool>> IsBlocked(long groupId, long userId)
    {
        try
        {
            var ett = await _context.GroupMembers.Where(x =>
                x.GroupId == groupId && x.UserId == userId && x.blocked == true
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

    public async Task<Result> AddBlock(long userId, long groupId)
    {
        try
        {
            var ett = await _context.GroupMembers.Where(x =>
                x.UserId == userId && x.GroupId == groupId && x.blocked == false
            ).AsNoTracking().FirstOrDefaultAsync();

            if (ett != null)
            {
                ett.blocked =true;
                _context.Update<GroupMember>(ett);
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
}
