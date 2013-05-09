<?php
function download($file) {
    header('Content-Description: File Transfer');
    header('Content-Type: text/csv charset=UTF-8');
    header('Content-Disposition: attachment; filename='.basename($file));
    header('Content-Transfer-Encoding: binary');
    header('Expires: 0');
    header('Cache-Control: must-revalidate');
    header('Pragma: public');
    header('Content-Length: ' . filesize($file));
    ob_clean();
    flush();
    readfile($file);
}

$fname = $_GET['fname'] . '.csv';

download('exports/' . $fname);
?>
