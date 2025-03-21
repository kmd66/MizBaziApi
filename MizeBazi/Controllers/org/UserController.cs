using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MizeBazi.Helper;
using System.Text;

namespace MizeBazi.Controllers
{
    public class UserController : _ControllerBase
    {
        readonly Service.UserService _service;

        public UserController(Service.UserService service)
        {
            _service = service;
        }

        [HttpPost("Get")]
        public Task<Models.Result<Models.UserDto>> Get()
            => _service.Get();

        [HttpPost("Edit")]
        public Task<Models.Result> Edit([FromBody] Models.UserEdit model)
            => _service.Edit(model);

        [HttpPost("GetAvatar")]
        public Task<Models.Result<string>> GetAvatar()
            => _service.GetAvatar();

        [HttpPost("GetViwe")]
        public Task<Models.Result<Models.UserView>> GetViwe()
            => _service.GetViwe();

        [HttpPost("ListViweById")]
        public Task<Models.Result<List<Models.UserView>>> ListViweById(List<long> ids)
            => _service.ListViweById(ids);

        #region application/octet-stream
        [HttpPost("get-bytes")]
        public async Task<IActionResult> GetBytes()
        {
            var t = await _service.GetViwe();
            var t2 = t.data;
            var t3 = t2.Img;
            return File(t3, "application/octet-stream");
        }
        [HttpPost("get-base64")]
        public async Task<IActionResult> Getbase64()
        {
            var t = await _service.GetViwe();
            var t2 = t.data;
            var t3 = t2.Img;
            var t4 = t3.Base64Encrypt();
            var t5 = System.Convert.FromBase64String(t4);
            return File(t4, "application/octet-stream");
        }

        [HttpPost("get-bytes-list")]
        public IActionResult GetBytesList()
        {
            // لیستی از آرایه‌های بایت
            var byteArrays = new List<byte[]>
            {
                new byte[] { 0x48, 0x65, 0x6C, 0x6C, 0x6F }, // "Hello"
                new byte[] { 0x57, 0x6F, 0x72, 0x6C, 0x64 }, // "World"
                new byte[] { 0x31, 0x32, 0x33, 0x34, 0x35 }  // "12345"
            };

            // ترکیب کردن لیست byte[] به یک byte[] واحد
            var combinedBytes = CombineByteArrays(byteArrays);

            // برگرداندن به عنوان یک فایل باینری با Content-Type: application/octet-stream
            return File(combinedBytes, "application/octet-stream");
        }
        // تابع برای ترکیب لیست byte[] به یک byte[] واحد
        private byte[] CombineByteArrays(List<byte[]> byteArrays)
        {
            // محاسبه طول کل آرایه ترکیبی
            int totalLength = byteArrays.Sum(arr => arr.Length);

            // ایجاد یک آرایه بایت با طول کل
            var combined = new byte[totalLength];

            // کپی کردن هر آرایه بایت به آرایه ترکیبی
            int offset = 0;
            foreach (var byteArray in byteArrays)
            {
                Buffer.BlockCopy(byteArray, 0, combined, offset, byteArray.Length);
                offset += byteArray.Length;
            }

            return combined;
        }
        #endregion

    }
}
