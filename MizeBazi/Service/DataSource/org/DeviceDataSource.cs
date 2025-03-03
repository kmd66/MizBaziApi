using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting;
using MizeBazi.Models;

namespace MizeBazi.DataSource
{
    public class DeviceDataSource : BaseDataSource
    {

        readonly OrgContexts _orgContexts;

        public DeviceDataSource()
        {
            _orgContexts = new OrgContexts();
        }

        public async Task<Result<List<DeviceGroupBy>>> List(DeviceDto model, int task = 10)
        {
            try
            {
                //var ett = await _orgContexts.Devices.Where(x =>
                //    (model.Phone == null || x.Phone == model.Phone)
                //    && (model.DeviceId == null || x.DeviceId == model.DeviceId)
                //    && x.Date > model.Date
                //).OrderBy(o => o.Date).Take(task).ToListAsync();
                var query = from d in _orgContexts.Set<Device>()
                            where d.DeviceId == model.DeviceId && d.Date > model.Date
                            group d by d.Phone
                            into g
                            select new DeviceGroupBy { Phone = g.Key, Count = g.Count() };
                var s = query.ToQueryString();
                var ett = await query.ToListAsync();

                return Result<List<DeviceGroupBy>>.Successful(data: ett);

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

        public async Task<Result> Add(DeviceDto model)
        {
            try
            {
                var ett = Map<Device, DeviceDto>(model);
                _orgContexts.Add<Device>(ett);
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
