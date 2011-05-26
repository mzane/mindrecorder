<?php
include_once("../model/server.inc.php");


class Label {
	// New label
	public function newLabel($db_labels, $newLabelNamePass, $newLabelFilterTypePass, $userIdPass) {
		if (isset($newLabelNamePass)) {
			$userId = (isset($userIdPass)) ? mysql_real_escape_string($userIdPass) : $_SESSION["userid"];
			$newLabelName = mysql_real_escape_string($newLabelNamePass);
			$newLabelFilterType = mysql_real_escape_string($newLabelFilterTypePass);

			$query = "SELECT * FROM $db_labels WHERE userId='$userId' AND name='$newLabelName'";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			if (is_array($data)) {
				echo '{"result": "error", "message": "Der Labelname existiert bereits. Versuchen Sie es mit einem anderen."}';
			} else {
				$query = "INSERT INTO $db_labels (userId,name,searchType) VALUES ('$userId','$newLabelName','$newLabelFilterType')";
				$result = mysql_query($query);

				$query = "SELECT * FROM $db_labels WHERE userId='$userId' AND name='$newLabelName' LIMIT 1";
				$result = mysql_query($query);
				$data = mysql_fetch_array($result);

				if (is_array($data)) {
					$output = '{"result": "success", "values": {"id": "'.$data["id"].'", "name": "'.$data["name"].'", "searchType": "'.$data["searchType"].'"}}';
					echo $output; // for use in js
					return $output; // for use in Registration
				} else {
					echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
				}
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Delete label
	public function deleteLabel($db_labels, $db_thoughts) {
		if (isset($_POST["labelId"])) {
			$userId = $_SESSION["userid"];
			$labelId = mysql_real_escape_string($_POST["labelId"]);

			// Move thoughts to trashcan
			$queryMove = "SELECT * FROM $db_thoughts WHERE labelId='$labelId' AND userId='$userId'";
			$resultMove = mysql_query($queryMove);
			if ($resultMove) {
				$queryMove = "UPDATE $db_thoughts SET labelId='999999999' WHERE labelId='$labelId' AND userId='$userId'";
				$resultMove = mysql_query($queryMove);
			}

			$query = "DELETE FROM $db_labels WHERE id='$labelId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);

			if ($result && $resultMove) {
				echo '{"result": "success"}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (labelId nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Get label data
	public function getLabelData($db_labels) {
		if (isset($_GET["labelId"])) {
			$userId = $_SESSION["userid"];
			$labelId = mysql_real_escape_string($_GET["labelId"]);

			$query = "SELECT * FROM $db_labels WHERE id='$labelId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			if (is_array($data)) {
				echo '{"result": "success", "values": {"id": "'.$data["id"].'", "name": "'.$data["name"].'", "searchType": "'.$data["searchType"].'"}}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (labelId nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Edit label
	public function editLabel($db_labels, $labelId) {
		if (isset($_POST["edit-label-name"]) && (isset($_POST["edit-label-filter-open"]) || isset($_POST["edit-label-filter-type"]))) {
			$userId = $_SESSION["userid"];
			$editLabelName = mysql_real_escape_string($_POST["edit-label-name"]);
			$editLabelFilterType = mysql_real_escape_string($_POST["edit-label-filter-type"]);

			$query = "UPDATE $db_labels SET name='$editLabelName',searchType='$editLabelFilterType' WHERE id='$labelId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);

			if ($result) {
				$query = "SELECT * FROM $db_labels WHERE id='$labelId' AND userId='$userId' LIMIT 1";
				$result = mysql_query($query);
				$data = mysql_fetch_array($result);

				echo '{"result": "success", "values": {"id": "'.$data["id"].'", "name": "'.$data["name"].'", "searchType": "'.$data["searchType"].'"}}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Get label list
	public function getLabelList($db_labels) {
		$userId = $_SESSION["userid"];

		$query = "SELECT * FROM $db_labels WHERE userId='$userId' ORDER BY name ASC";
		$result = mysql_query($query);
		$length = mysql_num_rows($result);
		$i = 0;

		if ($result) {
			echo '{"result": "success", "values": [';
			while ($row = mysql_fetch_array($result)) {
				echo ' {"id": "'.$row["id"].'", "name": "'.$row["name"].'", "searchType": "'.$row["searchType"].'"}';
				$i++;
				if ($i !== $length) {
					echo ',';
				}
			}
			echo ']}';
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
		}
	}
}


// Instantiate class
$label = new Label;

// New label
if (isset($_GET["action"]) && $_GET["action"] === "newLabel") {
	$label->newLabel($db_labels, $_POST["new-label-name"], $_POST["new-label-filter-type"], null);
}

// Delete label
if (isset($_GET["action"]) && $_GET["action"] === "deleteLabel") {
	$label->deleteLabel($db_labels, $db_thoughts);
}

// Get label data
if (isset($_GET["action"]) && $_GET["action"] === "getLabelData") {
	$label->getLabelData($db_labels);
}

// Edit label
if (isset($_GET["action"]) && $_GET["action"] === "editLabel") {
	$label->editLabel($db_labels, $_GET["labelId"]);
}

// Get label list
if (isset($_GET["action"]) && $_GET["action"] === "getLabelList") {
	$label->getLabelList($db_labels);
}
