<?php
include_once("../model/server.inc.php");


if (isset($_GET["term"])) {
	$userId = $_SESSION["userid"];
	$searchTerm = $_GET["term"];
	$query = "SELECT * FROM $db_thoughts WHERE userId='$userId' AND name LIKE '%$searchTerm%' ORDER BY name ASC";
	$result = mysql_query($query);

	$response = array();

	if (@mysql_num_rows($result)) {
		while ($row = mysql_fetch_array($result)) {
			array_push($response, array("id"=>$row["id"], "label"=>$row["name"], "labelId"=>$row["labelId"]));
		}
	}

	echo json_encode($response);
}
