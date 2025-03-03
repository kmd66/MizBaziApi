using Microsoft.EntityFrameworkCore;
using MizeBazi.Models;

namespace MizeBazi.DataSource
{
    public class UserDataSource : BaseDataSource
    {

        readonly OrgContexts _orgContexts;

        public UserDataSource()
        {
            _orgContexts = new OrgContexts();
        }

        public async Task<Result<UserDto>> GetByPhone(string phone)
        {
            try
            {
                var ett = await _orgContexts.Users.Where(x =>
                    x.Phone == phone
                ).Take(1).FirstOrDefaultAsync();

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
    }
}
