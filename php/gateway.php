<?php

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "http://api.gravitycontrol.net?{$_SERVER['QUERY_STRING']}");
curl_setopt($ch, CURLOPT_POST, count($_POST));
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($_POST));

curl_exec($ch);
curl_close($ch);
?>