//<h1>آپلود عکس با jQuery AJAX</h1>
//<form id="uploadForm">
//    <input type="file" id="imageInput" accept="image/*" required>
//    <button type="submit">آپلود</button>
//</form>

//<p id="statusMessage"></p>

$(document).ready(function () {
    $('#uploadForm').on('submit', function (event) {
        event.preventDefault(); // جلوگیری از ارسال فرم به صورت پیش‌فرض
        debugger
        const fileInput = $('#imageInput')[0];
        const statusMessage = $('#statusMessage');

        // بررسی آیا فایلی انتخاب شده است
        if (fileInput.files.length === 0) {
            statusMessage.text('لطفاً یک عکس انتخاب کنید.');
            return;
        }

        const file = fileInput.files[0];

        // ایجاد FormData برای ارسال فایل
        const formData = new FormData();
        formData.append('image', file);

        // ارسال درخواست AJAX با jQuery
        $.ajax({
            url: 'https://localhost:7230/api/v1/Upload/Avatar',
            type: 'POST',
            data: formData,
            processData: false, // جلوگیری از پردازش داده‌ها توسط jQuery
            contentType: false, // جلوگیری از تنظیم contentType به صورت پیش‌فرض
            headers: {
                'Auth': "SijxYoHyHLWXf+WDK3USD7aYoLRSyHc4oxxLjRswit1ZFR6zrXynjwqB3HJ9ijDcSYIAH7WeyQ6Wo9UVHUBtzuftvxkpFQNWtZ4HXk8s9kWzwX1ASlXcL3JpNyhPKDPiwyCGtla0J8W43HbjQfQsjgDYEVvZX7PmT+Ua71SCH0C3ZPatKoAiX1iC1ddFErUaDUH2xNEklcUVfGdXj9U2z111LesFu3PuXWl+rBeO81jwBKJJn3MfFlXJPOoB2vKD",
                'D-Id': `067a6307cc24ecdf3809125864da24ef`
            },
            success: function (response) {
                statusMessage.text('عکس با موفقیت آپلود شد: ' + response.message);
            },
            error: function (xhr, status, error) {
                statusMessage.text('خطا در آپلود عکس: ' + error);
            }
        });
    });
});