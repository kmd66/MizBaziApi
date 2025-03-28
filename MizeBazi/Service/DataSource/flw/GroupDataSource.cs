using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.ComponentModel.DataAnnotations.Schema;
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

    public async Task<Result<GroupView>> Add(Group model)
    {
        try
        {
            _context.Add<Group>(model);
            await _context.SaveChangesAsync();

            var modelMember = new GroupMember { 
                GroupId = model.Id,
                UserId = model.CreateId
            };
            _context.Add<GroupMember>(modelMember);
            await _context.SaveChangesAsync();

            return await Get(id: model.Id);
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

    public async Task<Result<bool>> IsAdd(long userId)
    {
        try
        {
            var ett = await _context.Groups.Where(x =>
                x.CreateId == userId
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

    public async Task<Result> Edite(GroupEdit model)
    {
        try
        {
            var ett = await _context.Groups.Where(x =>
                x.Id == model.Id
            ).Take(1).FirstOrDefaultAsync();
            if (ett != null)
            {
                ett.Name = model.Name;
                ett.Description = model.Description;
                ett.Password = model.Password;
                _context.Update<Group>(ett);
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

    public async Task<Result<GroupView>> Get(long id = 0, long createId = 0, string uniqueName = null)
    {
        try
        {
            if (id == 0 && createId == 0 && string.IsNullOrEmpty(uniqueName))
                throw MizeBaziException.Error(message: "params null");

            var query = $"flw.GetGroup @Id = {id.Query()}" +
                $", @CreateId = {createId.Query()}" +
                $", @UniqueName = {uniqueName.Query()}";

            var ett = await _context.GroupViews.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<GroupView>.Successful(data: ett.FirstOrDefault());
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

    public async Task<Result<List<GroupView>>> List(long userId)
    {
        try
        {
            var query = $"flw.ListGroup @UserId = {userId.Query()}";

            var ett = await _context.GroupViews.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<GroupView>>.Successful(data: ett);
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

    public async Task<Result<List<GroupView>>> Search(string name)
    {
        try
        {
            var query = $"flw.SearchGroup @Name  = {name.Query()}";

            var ett = await _context.GroupViews.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

            return Result<List<GroupView>>.Successful(data: ett);
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

    public async Task<Result> Remove(long id, long userId)
    {
        try
        {
            var group = await _context.Groups.Where(x =>
                x.Id == id && x.CreateId == userId
            ).AsNoTracking().FirstOrDefaultAsync();

            if (group != null)
            {
                var groupMembers = await _context.GroupMembers.Where(x =>
                    x.GroupId == group.Id
                ).AsNoTracking().ToListAsync();

                _context.Groups.Remove(group);
                _context.GroupMembers.RemoveRange(groupMembers);
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

    public async Task<Result<int>> Count(long userId, bool blocked = false)
    {
        try
        {
            var ett = await _context.GroupMembers.Where(x => x.UserId == userId && x.blocked == blocked).CountAsync();

            return Result<int>.Successful(data: ett);
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
