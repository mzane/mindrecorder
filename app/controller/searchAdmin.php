<?php
include_once("../model/server.inc.php");


if (isset($_GET["term"])) {
	$userId = $_SESSION["userid"];
	$searchTerm = $_GET["term"];
	$query = "SELECT * FROM $db_user WHERE firstName LIKE '%$searchTerm%' AND rights='0' OR lastName LIKE '%$searchTerm%' AND rights='0' ORDER BY id ASC";
	$result = mysql_query($query);

	$response = array();

	if (@mysql_num_rows($result)) {
		while ($row = mysql_fetch_array($result)) {
			array_push($response, array("id"=>$row["id"], "label"=>$row["firstName"]." ".$row["lastName"]));
		}
	}

	echo json_encode($response);
}
