<?php
include_once("../model/server.inc.php");
include_once("Objects.php");


class User {
	// Get user data
	public function getUserData($db_user, $db_labels, $db_thoughts, $db_objects, $serverPathUser) {
		$userId = (isset($_GET["userId"])) ? mysql_real_escape_string($_GET["userId"]) : $_SESSION["userid"]; // Adminpage calls this method also, which passes the userId by GET

		if (isset($userId)) {
			$query = "SELECT * FROM $db_user WHERE id='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			$queryLabels = "SELECT * FROM $db_labels WHERE userId='$userId'";
			$resultLabels = mysql_query($queryLabels);
			$queryThoughts = "SELECT * FROM $db_thoughts WHERE userId='$userId'";
			$resultThoughts = mysql_query($queryThoughts);
			$queryObjects = "SELECT * FROM $db_objects WHERE userId='$userId'";
			$resultObjects = mysql_query($queryObjects);

			// Get user directory's size
			$objects = new Objects;
			$userDirSize = $objects->getUserDirSize($serverPathUser, $userId);
			$userDirSize = calcByteUnit($userDirSize);

			if (is_array($data)) {
				echo '{"result": "success", "values": {"id": "'.$data["id"].'", "firstName": "'.$data["firstName"].'", "lastName": "'.$data["lastName"].'", "email": "'.$data["email"].'", "password": "'.$data["password"].'", "activated": "'.$data["activated"].'", "labels": "'.mysql_num_rows($resultLabels).'", "thoughts": "'.mysql_num_rows($resultThoughts).'", "objects": "'.mysql_num_rows($resultObjects).'", "userDirSize": "'.$userDirSize.'"}}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (userId ist nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Set user data
	public function setUserData($db_user, $serverPathUser) {
		$userId = (isset($_GET["userId"])) ? mysql_real_escape_string($_GET["userId"]) : $_SESSION["userid"]; // Adminpage calls this method also which passes the userId by GET
		$firstName = mysql_real_escape_string($_POST["user-firstname"]);
		$lastName = mysql_real_escape_string($_POST["user-lastname"]);
		$email = mysql_real_escape_string($_POST["user-email"]);

		// Normal user uses the checkbox differently than admin
		if ($_SESSION["rights"] < 99) {
			$activated = (isset($_POST["user-activated"])) ? "0" : "1";
		} else {
			$activated = (isset($_POST["user-activated"])) ? "1" : "0";
		}

		// Update data
		if (isset($_POST["user-password"]) && strlen($_POST["user-password"]) >= 5) {
			$password = mysql_real_escape_string($_POST["user-password"]);
			$password = md5($password);
		} else {
			$password = mysql_real_escape_string($_POST["user-password-md5"]);
		}
		$query = "UPDATE $db_user SET firstName='$firstName',lastName='$lastName',email='$email',activated='$activated',password='$password' WHERE id='$userId' LIMIT 1";
		$result = mysql_query($query);

		if ($result) {
			$query = "SELECT * FROM $db_user WHERE id='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			// Update session data only when a normal user calls this
			if ($_SESSION["rights"] < 99) {
				$_SESSION["firstName"] = $data["firstName"];
				$_SESSION["lastName"] = $data["lastName"];
				$_SESSION["email"] = $data["email"];
				$_SESSION["activated"] = $data["activated"];
			}

			// Update cookie
			include_once("Cookie.php");
			$cookie = new Cookie;
			$cookie->setLoginCookie($data);

			// DEACTIVATION
			if ($data["activated"] == "0" && $_SESSION["rights"] < 99) {
				include_once("Logout.php");
				echo '{"result": "deactivate"}';
			} else {
				echo '{"result": "success", "values": {"id": "'.$data["id"].'", "firstName": "'.$data["firstName"].'"}}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Set session data
	public function setSessionData($db_user) {
		$userId = $_SESSION["userid"];
		$OpenLabel = mysql_real_escape_string($_POST["OpenLabel"]);
		$OpenThoughts = mysql_real_escape_string($_POST["OpenThoughts"]);
		$OpenThought = mysql_real_escape_string($_POST["OpenThought"]);
		$LabelListWidth = mysql_real_escape_string($_POST["LabelListWidth"]);
		$ObjectListWidth = mysql_real_escape_string($_POST["ObjectListWidth"]);

		$sessionData = '{"OpenLabel": "'.$OpenLabel.'", "OpenThoughts": "'.$OpenThoughts.'", "OpenThought": "'.$OpenThought.'", "LabelListWidth": "'.$LabelListWidth.'", "ObjectListWidth": "'.$ObjectListWidth.'"}';

		$query = "UPDATE $db_user SET lastSession='$sessionData' WHERE id='$userId' LIMIT 1";
		mysql_query($query);
	}

	// Get session data
	public function getSessionData($db_user) {
		$userId = $_SESSION["userid"];

		$query = "SELECT * FROM $db_user WHERE id='$userId' LIMIT 1";
		$result = mysql_query($query);
		$data = mysql_fetch_array($result);

		echo $data["lastSession"];
	}
}


$user = new User;

// Get user data
if (isset($_GET["action"]) && $_GET["action"] === "getUserData") {
	$user->getUserData($db_user, $db_labels, $db_thoughts, $db_objects, $serverPathUser);
}

// Set user data
if (isset($_POST["user-firstname"]) && isset($_POST["user-lastname"]) && isset($_POST["user-email"])) {
	$user->setUserData($db_user, $serverPathUser);
}

// Set session data
if (isset($_GET["action"]) && $_GET["action"] === "setSessionData") {
	$user->setSessionData($db_user);
}

// Get session data
if (isset($_GET["action"]) && $_GET["action"] === "getSessionData") {
	$user->getSessionData($db_user);
}
