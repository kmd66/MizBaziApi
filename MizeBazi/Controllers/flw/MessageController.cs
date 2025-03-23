using Microsoft.AspNetCore.Mvc;
using MizeBazi.DataSource;
using MizeBazi.Helper;
using MizeBazi.Models;

namespace MizeBazi.Controllers
{
    public class MessageController : _ControllerBase
    {

        readonly IRequestInfo _requestInfo;
        readonly MessageDataSource _dtaSource;
        public MessageController(IRequestInfo requestInfo)
        {
            _requestInfo = requestInfo;
            _dtaSource = new MessageDataSource();
        }


        [HttpPost, Route("Add")]
        public async Task<Result> Add(MessageAdd model) {
            var message = model.Validate();
            message.SenderID = _requestInfo.model.UserId;
            message.ReceiverID = model.ReceiverID;
            var result = await _dtaSource.Add(message);
            
            if (result.success)
            {
                _ = Task.Run(async () =>
                {
                    await ProcessMessageAsync(message);
                });
            }
            return result;
        }

        private async Task ProcessMessageAsync(Message message)
        {
            await Task.Delay(5000);
        }


        [HttpPost, Route("Remove")]
        public Task<Result> Remove(long id)
            => _dtaSource.Remove(_requestInfo.model.UserId, id);

        [HttpPost, Route("List")]
        public Task<Result<List<MessageVeiw>>> List()
            => _dtaSource.List(_requestInfo.model.UserId);

        [HttpPost, Route("ListForRoom")]
        public Task<Result<List<MessageVeiw>>> ListForRoom(long userId)
            => _dtaSource.ListForRoom(_requestInfo.model.UserId, userId);

        [HttpPost, Route("ListNotification")]
        public Task<Result<List<NotificationVeiw>>> ListNotification()
            => _dtaSource.ListNotification(_requestInfo.model.UserId);

    }
}
