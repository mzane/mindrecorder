<?php
session_start();


// DB connection
$db = mysql_connect("XX", "XX", "XX");
if (!$db){
	die("Keine Datenbankverbindung!");
}

// Select DB
mysql_select_db("db356615550");

// Init db table vars
$db_user = "user";
$db_labels = "labels";
$db_thoughts = "thoughts";
$db_objects = "objects";
$db_filetypes = "filetypes";


// Init session
if (!isset($_SESSION["login"])) {
	$_SESSION["login"] = false;
	$_SESSION["userid"] = null;
	$_SESSION["firstName"] = null;
	$_SESSION["lastName"] = null;
	$_SESSION["email"] = null;
	$_SESSION["rights"] = null;
	$_SESSION["activated"] = null;
}


// Init vars - everything needs to be relative since it must run on the SAE-server (DEPRECATED!)
$serverHost = "http://mindrecorder.net";
$serverPathRoot = "/";
$serverPathModel = "app/model/";
$serverPathView = "app/view/";
$serverPathController = "app/controller/";
$serverPathUser = "user/";

$maxUploadFileSize = 2000000; // Maximum file size of 2 MB for upload
$maxUploadFileSizeAll = 2000000000; // Maximum of 2 GB for all files in user dir
$maxUploadConcurrentFiles = 10; // Maximum of 10 concurrent uploaded files


// Calculate/convert byte size (http://www.hoerandl.com/mambo/code_schnipsel/php/byte_in_kb_und_mb_umwandeln.html)
function calcByteUnit($bytes) {
	if ($bytes > pow(2,10)) {
		if ($bytes > pow(2,20)) {
			$size = number_format(($bytes / pow(2,20)), 2);
			$size .= " MB";
			return $size;
		} else {
			$size = number_format(($bytes / pow(2,10)), 2);
			$size .= " kB";
			return $size;
		}
	} else {
		$size = (string) $bytes . " Byte";
		return $size;
	}
}
?>