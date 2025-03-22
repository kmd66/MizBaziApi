using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Models;

namespace MizeBazi.DataSource
{
    public class DeviceDataSource : BaseDataSource
    {

        readonly OrgContexts _context;

        public DeviceDataSource()
        {
            _context = new OrgContexts();
        }

        public async Task<Result<List<DeviceGroupBy>>> List(DeviceDto model, int task = 10)
        {
            try
            {
                //var ett = await _context.Devices.Where(x =>
                //    (model.Phone == null || x.Phone == model.Phone)
                //    && (model.DeviceId == null || x.DeviceId == model.DeviceId)
                //    && x.Date > model.Date
                //).OrderBy(o => o.Date).Take(task).ToListAsync();
                var query = from d in _context.Set<Device>()
                            where d.DeviceId == model.DeviceId && d.Date > model.Date
                            group d by d.Phone
                            into g
                            select new DeviceGroupBy { Phone = g.Key, Count = g.Count() };

                var ett = await query.AsNoTracking().ToListAsync();

                return Result<List<DeviceGroupBy>>.Successful(data: ett);

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

        public async Task<Result> Add(DeviceDto model)
        {
            try
            {
                var ett = Map<Device, DeviceDto>(model);
                _context.Add<Device>(ett);
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
