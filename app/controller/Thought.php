<?php
include_once("../model/server.inc.php");
include_once("Objects.php");

// todo: Every method in here should be named "thought" not "object"


class Thought {
	// New thought
	public function newThought($db_thoughts, $userIdPass, $newThoughtNamePass, $newThoughtContentPass, $newThoughtLabelIdPass, $newThoughtDescPass) {
		if (isset($newThoughtNamePass) && isset($newThoughtLabelIdPass)) {
			$userId = (isset($userIdPass)) ? mysql_real_escape_string($userIdPass) : $_SESSION["userid"];
			$newThoughtName = mysql_real_escape_string($newThoughtNamePass);
			$newThoughtContent = "";
			if (isset($newThoughtContentPass)) { // optional: only when saving "new"-thought
				$newThoughtContent = htmlspecialchars($newThoughtContentPass);
			}
			$newThoughtLabel = mysql_real_escape_string($newThoughtLabelIdPass);
			$newThoughtDesc = mysql_real_escape_string($newThoughtDescPass);
			$date = mktime();

			$query = "INSERT INTO $db_thoughts (userId,name,content,labelId,description,date) VALUES ('$userId','$newThoughtName','$newThoughtContent','$newThoughtLabel','$newThoughtDesc','$date')";
			$result = mysql_query($query);

			$query = "SELECT * FROM $db_thoughts WHERE userId='$userId' AND name='$newThoughtName' AND labelId='$newThoughtLabel' AND date='$date' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			if (is_array($data)) {
				$output = '{"result": "success", "values": {"id": "'.$data["id"].'", "name": "'.$data["name"].'", "description": "'.$data["description"].'", "labelId": "'.$data["labelId"].'", "date": "'.date('d.m.Y, H:i', $data["date"]).'"}}';
				echo $output; // for use in js
				return $output; // for use in Registration
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Delete thought
	public function deleteThought($db_thoughts, $db_objects, $serverPathUser) {
		if (isset($_POST["objectId"])) {
			$userId = $_SESSION["userid"];
			$thoughtId = mysql_real_escape_string($_POST["objectId"]);

			$query = "DELETE FROM $db_thoughts WHERE id='$thoughtId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);

			// Delete child objects also if there are any
			$queryDeleteObjects = "SELECT * FROM $db_objects WHERE thoughtId='$thoughtId'";
			$resultDeleteObjects = mysql_query($queryDeleteObjects);
			if (@mysql_num_rows($resultDeleteObjects)) {
				$objects = new Objects;
				while ($rowDeleteObjects = mysql_fetch_array($resultDeleteObjects)) {
					$objects->deleteObjects($serverPathUser, $db_objects, $rowDeleteObjects["id"]);
				}
			}

			if ($result) {
				echo '{"result": "success"}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Get thought data (for editing thought)
	public function getThoughtData($db_thoughts) {
		if (isset($_GET["objectId"])) {
			$userId = $_SESSION["userid"];
			$objectId = mysql_real_escape_string($_GET["objectId"]);

			$query = "SELECT * FROM $db_thoughts WHERE id='$objectId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			if (is_array($data)) {
				echo '{"result": "success", "values": {"id": "'.$data["id"].'", "name": "'.$data["name"].'", "description": "'.$data["description"].'", "labelId": "'.$data["labelId"].'", "date": "'.date('d.m.Y, H:i', $data["date"]).'"}}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Edit thought
	public function editObject($db_thoughts, $objectId) {
		if (isset($_POST["edit-thought-name"]) && isset($_POST["edit-thought-label"])) {
			$userId = $_SESSION["userid"];
			$editThoughtName = mysql_real_escape_string($_POST["edit-thought-name"]);
			$editThoughtLabel = mysql_real_escape_string($_POST["edit-thought-label"]);
			$editThoughtDesc = mysql_real_escape_string($_POST["edit-thought-desc"]);
			$date = mktime();

			$query = "UPDATE $db_thoughts SET name='$editThoughtName',labelId='$editThoughtLabel',description='$editThoughtDesc',date='$date' WHERE id='$objectId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);

			if ($result) {
				$query = "SELECT * FROM $db_thoughts WHERE id='$objectId' AND userId='$userId' LIMIT 1";
				$result = mysql_query($query);
				$data = mysql_fetch_array($result);
				
				echo '{"result": "success", "values": {"id": "'.$data["id"].'", "name": "'.$data["name"].'", "description": "'.$data["description"].'", "labelId": "'.$data["labelId"].'", "date": "'.date('d.m.Y, H:i', $data["date"]).'"}}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Get thought content
	public function getThoughtContent($db_thoughts) {
		if (isset($_GET["thoughtId"])) {
			$userId = $_SESSION["userid"];
			$thoughtId = mysql_real_escape_string($_GET["thoughtId"]);

			$query = "SELECT * FROM $db_thoughts WHERE id='$thoughtId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			if (is_array($data)) {
				echo '{"result": "success", "values": {"id": "'.$data["id"].'", "name": "'.$data["name"].'", "labelId": "'.$data["labelId"].'", "content": "'.str_replace("\"", "'", htmlspecialchars_decode($data["content"])).'"}}'; // due to json-format we need to replace all double-quotes with single-quotes
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (GET-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Set thought content
	public function setThoughtContent($db_thoughts) {
		if (isset($_POST["canvas-content-pusher-content"])) {
			$userId = $_SESSION["userid"];
			$thoughtId = mysql_real_escape_string($_GET["thoughtId"]);
			$content = htmlspecialchars(str_replace("script", "scr_ipt", $_POST["canvas-content-pusher-content"]));
			$date = mktime();

			$query = "UPDATE $db_thoughts SET content='$content',date='$date' WHERE id='$thoughtId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);

			if ($result) {
				echo '{"result": "success"}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}
}


// Instantiate class
$thought = new Thought;

// New thought
if (isset($_GET["action"]) && $_GET["action"] === "newThought") {
	$thought->newThought($db_thoughts, null, $_POST["new-thought-name"], $_POST["new-thought-content"], $_POST["new-thought-label"], $_POST["new-thought-desc"]);
}

// Delete object (also thought)
if (isset($_GET["action"]) && $_GET["action"] === "deleteThought") {
	$thought->deleteThought($db_thoughts, $db_objects, $serverPathUser);
}

// Get object data (for editing object)
if (isset($_GET["action"]) && $_GET["action"] === "getThoughtData") {
	$thought->getThoughtData($db_thoughts);
}

// Edit object (also thoughts)
if (isset($_GET["action"]) && $_GET["action"] === "editObject") {
	$thought->editObject($db_thoughts, $_GET["objectId"]);
}

// Get thought content
if (isset($_GET["action"]) && $_GET["action"] === "getThoughtContent") {
	$thought->getThoughtContent($db_thoughts);
}

// Save thought content
if (isset($_GET["action"]) && $_GET["action"] === "setThoughtContent") {
	$thought->setThoughtContent($db_thoughts);
}
