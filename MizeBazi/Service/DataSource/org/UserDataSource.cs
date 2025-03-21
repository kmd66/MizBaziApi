using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Helper;
using MizeBazi.Models;
using System.Threading;

namespace MizeBazi.DataSource
{
    public class UserDataSource : BaseDataSource
    {

        readonly OrgContexts _orgContexts;

        public UserDataSource()
        {
            _orgContexts = new OrgContexts();
        }

        public async Task<Result<UserDto>> Get(long id)
        {
            try
            {
                var ett = await _orgContexts.Users.Where(x =>
                    x.Id == id
                ).AsNoTracking().Take(1).FirstOrDefaultAsync();

                var returnModel = Map<UserDto, User>(ett);

                return Result<UserDto>.Successful(data: returnModel);
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }

        public async Task<Result<UserView>> GetViwe(long id)
        {
            try
            {
                var query = System.Runtime.CompilerServices.FormattableStringFactory.Create($"org.SpGetUser @Id = {id.Query()}");
                var ett = await _orgContexts.UsersView.FromSql(query).ToListAsync();//.FirstOrDefaultAsync();

                return Result<UserView>.Successful(data: ett.FirstOrDefault());
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }

        public async Task<Result<List<UserView>>> ListViweById(List<long> ids)
        {
            try
            {
                if(ids.Count < 1)
                    return Result<List<UserView>>.Successful(data: new List<UserView>());

                var _ids = System.Text.Json.JsonSerializer.Serialize(ids);
                var query = $"org.ListUser @Count = {ids.Count.Query()}" +
                    $", @Json = {_ids.JsonQuery()}";
                var ett = await _orgContexts.UsersView.FromSql(System.Runtime.CompilerServices.FormattableStringFactory.Create(query)).ToListAsync();

                return Result<List<UserView>>.Successful(data: ett);
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }

        public async Task<Result<UserDto>> GetByPhone(string phone)
        {
            try
            {
                var ett = await _orgContexts.Users.Where(x =>
                    x.Phone == phone
                ).AsNoTracking().Take(1).FirstOrDefaultAsync();

                var returnModel = Map<UserDto, User>(ett);

                return Result<UserDto>.Successful(data: returnModel);
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }

        public async Task<Result> Add(UserRegister model)
        {
            try
            {
                var ett = Map<User, UserRegister>(model);
                _orgContexts.Add<User>(ett);
                await _orgContexts.SaveChangesAsync();

                return Result.Successful();
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }
        }

        public async Task<Result> Edit(UserEdit model, long id, bool userNameEdit = false)
        {
            try
            {
                var ett = await _orgContexts.Users.Where(x =>
                    x.Id == id
                ).Take(1).FirstOrDefaultAsync();
                if (ett == null)
                    throw MizeBaziException.Error(message: "Edit ett null");

                ett.FirstName = model.FirstName;
                ett.LastName = model.LastName;
                if (userNameEdit)
                    ett.UserName = model.UserName;

                _orgContexts.Update<User>(ett);
                await _orgContexts.SaveChangesAsync();

                return Result.Successful();
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }
        }
        public async Task<Result> UniqueUserName(string userName)
        {
            try
            {
                var ett = await _orgContexts.Users.Where(x =>
                    x.UserName == userName
                ).AsNoTracking().Take(1).FirstOrDefaultAsync();

                if (ett == null)
                    return Result<UserDto>.Successful();
                return Result<UserDto>.Failure(message: "این نام کاربری قبلا ثبت شده اشت");
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }

        public async Task<Result> AddAvatar(UserThumbnail model)
        {
            try
            {
                var thumbnail = _orgContexts.UsersThumbnail.AsNoTracking().FirstOrDefault(p => p.Id == model.Id);

                _orgContexts.Entry(model).State = thumbnail != null ? EntityState.Modified : EntityState.Added;
                _orgContexts.SaveChanges();

                return Result.Successful();
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }

        public async Task<Result<byte[]>> GetAvatar(long id)
        {
            try
            {
                var ett = await _orgContexts.UsersThumbnail.Where(x =>
                    x.Id == id
                ).AsNoTracking().Take(1).FirstOrDefaultAsync();

                return Result<byte[]>.Successful(data: ett?.img);
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }

        public async Task<Result<List<byte[]>>> ListAvatar(List<long> ids)
        {
            try
            {
                var ett = await _orgContexts.UsersThumbnail
                    .Where(x => ids.Contains(x.Id)).AsNoTracking().ToListAsync();
                var result = ett.Select(x => x.img).ToList();

                return Result<List<byte[]>>.Successful(data: result);
            }
            catch (Exception ex)
            {
                throw MizeBaziException.Error(message: ex.Message);
            }
            finally
            {
                _orgContexts.ChangeTracker.Clear();
            }

        }
    }
}
