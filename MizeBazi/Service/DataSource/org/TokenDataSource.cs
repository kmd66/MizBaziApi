using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Models;

namespace MizeBazi.DataSource
{
    public class TokenDataSource : BaseDataSource
    {

        readonly OrgContexts _context;

        public TokenDataSource()
        {
            _context = new OrgContexts();
        }

        public async Task<Result<TokenDto>> Get(Guid id)
        {
            try
            {
                var ett = await _context.Tokens.Where(x =>
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
                _context.ChangeTracker.Clear();
            }
        }

        public async Task<Result> RemoveAllToken(long UserId)
        {
            try
            {
                var sqlQuery = $"UPDATE [org].[Tokens] SET IsValid = 0 WHERE [UserId] = {UserId} AND IsValid = 1";
                _context.Database.ExecuteSqlRaw(sqlQuery);

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

        public async Task<Result> Add(TokenDto model)
        {
            try
            {
                var ett = Map<Token, TokenDto>(model);
                _context.Add<Token>(ett);
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
}
