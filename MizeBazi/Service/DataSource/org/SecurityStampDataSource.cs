﻿using Microsoft.EntityFrameworkCore;
using MizeBazi.Helper;
using MizeBazi.Models;

namespace MizeBazi.DataSource
{
    public class SecurityStampDataSource : BaseDataSource
    {

        readonly OrgContexts _context;

        public SecurityStampDataSource()
        {
            _context = new OrgContexts();
        }


        public async Task<Result<List<SecurityStampDto>>> ListByPhone(string phone, DateTime date, int Task = 5)
        {
            try
            {
                var ett = await _context.SecurityStamps.Where(x =>
                    x.Phone == phone
                    && x.Date > date
                ).AsNoTracking().OrderByDescending(o => o.Date).Take(Task).ToListAsync();

                var returnModel = MapList<SecurityStampDto, SecurityStamp>(ett) as List<SecurityStampDto>;

                return Result<List<SecurityStampDto>>.Successful(data: returnModel);

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

        public async Task<Result> Add(SecurityStampDto model)
        {
            try
            {
                var ett = Map<SecurityStamp, SecurityStampDto>(model);
                _context.Add<SecurityStamp>(ett);
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

        public async Task<Result<SecurityStampDto>> GetLast(string phone)
        {
            try
            {
                var ett = await _context.SecurityStamps.Where(x =>
                    x.Phone == phone
                ).AsNoTracking().OrderByDescending(o => o.Date).FirstOrDefaultAsync();

                if (ett == null)
                    return Result<SecurityStampDto>.Successful(data: null);

                ett.Count++;

                _context.Update<SecurityStamp>(ett);
                await _context.SaveChangesAsync();

                var returnModel = Map<SecurityStampDto, SecurityStamp>(ett);

                return Result<SecurityStampDto>.Successful(data: returnModel);

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

        public async Task<Result> Expiry(Guid id)
        {
            try
            {
                var sqlQuery = $"UPDATE org.SecurityStamps SET [Date] = {DateTime.Now.AddDays(-1).Query()} WHERE [Id] = {id.Query()}";
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
    }
}
