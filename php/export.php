<?php

if (get_magic_quotes_gpc()) {

    function stripslashes_deep($value) {
        $value = is_array($value) ?
                array_map('stripslashes_deep', $value) :
                stripslashes($value);

        return $value;
    }

    $_POST = array_map('stripslashes_deep', $_POST);
    $_GET = array_map('stripslashes_deep', $_GET);
    $_COOKIE = array_map('stripslashes_deep', $_COOKIE);
    $_REQUEST = array_map('stripslashes_deep', $_REQUEST);
}

function download($file) {
    header('Content-Description: File Transfer');
    header('Content-Type: text/csv charset=UTF-8');
    header('Content-Disposition: attachment; filename=' . basename($file));
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    ob_clean();
    flush();
    readfile($file);
}

$fname = $_POST['fname'];
$data = $_POST['data'];

$data = explode("@@DELIM_ROWS@@", $data);
foreach ($data AS &$row) {
    $row = explode("@@DELIM_COLS@@", $row);
}

$csv_folder = 'exports';
$filename = "export_" . $fname . '_' . date("Y-m-d_H-i-s");
$CSVFileName = $csv_folder . '/' . $filename . '.csv';
$FileHandle = fopen($CSVFileName, 'w') or die("can't open file");
fclose($FileHandle);
$fp = fopen($CSVFileName, 'w');
foreach ($data as $fields) {
    fputcsv($fp, $fields);
}
fclose($fp);

echo $filename;
?>