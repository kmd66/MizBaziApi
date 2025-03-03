using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Models;

namespace MizeBazi.DataSource
{
    public class TokenDataSource : BaseDataSource
    {

        readonly OrgContexts _orgContexts;

        public TokenDataSource()
        {
            _orgContexts = new OrgContexts();
        }

        public async Task<Result> RemoveAllToken(long UserId)
        {
            try
            {
                var sqlQuery = $"UPDATE [org].[Tokens] SET IsValid = 0 WHERE [UserId] = {UserId}";
                _orgContexts.Database.ExecuteSqlRaw(sqlQuery);

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

        public async Task<Result> Add(TokenDto model)
        {
            try
            {
                var ett = Map<Token, TokenDto>(model);
                _orgContexts.Add<Token>(ett);
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
