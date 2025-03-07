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

        public async Task<Result<TokenDto>> Get(Guid id)
        {
            try
            {
                var ett = await _orgContexts.Tokens.Where(x =>
                    x.Id == id && x.IsValid == true
                ).AsNoTracking().Take(1).FirstOrDefaultAsync();

                var returnModel = Map<TokenDto, Token>(ett);

                return Result<TokenDto>.Successful(data: returnModel);
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

        public async Task<Result> RemoveAllToken(long UserId)
        {
            try
            {
                var sqlQuery = $"UPDATE [org].[Tokens] SET IsValid = 0 WHERE [UserId] = {UserId} AND IsValid = 1";
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
