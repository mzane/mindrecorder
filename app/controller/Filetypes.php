<?php
include_once("../model/server.inc.php");

// todo: Rename Filetypes to Doctypes


class Filetype {
	// Handle filetypes
	public function handleFiletypes($db_filetypes) {
		if (isset($_POST["filetype"])) {
			$filetype = mysql_real_escape_string($_POST["filetype"]);

			// todo: Look if filetype already exists
/*			$query = "SELECT * FROM $db_filetypes WHERE type='$filetype' LIMIT 1";
			$result = mysql_query($query);*/

			$query = "INSERT INTO $db_filetypes (type) VALUES ('$filetype')";
			mysql_query($query);
		}
	}
}


// Handle filetypes
if (isset($_GET["action"]) && $_GET["action"] === "handleFiletypes") {
	$filetype = new Filetype;
	$filetype->handleFiletypes($db_filetypes);
}