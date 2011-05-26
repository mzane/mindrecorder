<?php
include_once("../model/server.inc.php");


class Login {
	// Set session
	private function setLoginSession($data) {
		$_SESSION["login"] = true;
		$_SESSION["userid"] = $data["id"];
		$_SESSION["firstName"] = $data["firstName"];
		$_SESSION["lastName"] = $data["lastName"];
		$_SESSION["email"] = $data["email"];
		$_SESSION["rights"] = $data["rights"];
		$_SESSION["activated"] = $data["activated"];
	}


	// Login
	public function doLogin($email, $password, $db_user) {
		// Check for user
		$query = "SELECT * FROM $db_user WHERE email='$email' AND password='$password' LIMIT 1";
		$result = mysql_query($query);
		$data = mysql_fetch_array($result);

		if ($data) {
			$this->setLoginSession($data);

			include_once("Cookie.php");
			$cookie = new Cookie;
			$cookie->setLoginCookie($data);

			// Hard redirect for the admin
			if ($data["rights"] == 99) {
				return "admin";
			} else if ($data["activated"] == "0") {
			    return "deactivated";
			} else {
				return true;
			}
		} else {
			return false;
		}
	}
}


if (isset($_POST["login-email"]) && isset($_POST["login-password"])) {
	$email = mysql_real_escape_string($_POST["login-email"]);
	$password = mysql_real_escape_string($_POST["login-password"]);
	$password = md5($password);

	$login = new Login;
	$loginReturn = $login->doLogin($email, $password, $db_user);

	if ($loginReturn === "admin") {
		echo "mind-login-admin";
	} else if ($loginReturn === "deactivated") {
		echo "mind-login-deactivated";
	} else if ($loginReturn) {
		echo "mind-login-success";
	} else {
		echo "mind-login-userUnknown";
	}
}


// Check cookie and log in automatically - somehow the deleteCookie is not working so we can't use this right now
/*
if (isset($_COOKIE["mindSessionCookie"]) && strpos($_COOKIE["mindSessionCookie"], "mindUser") === 0) {
	header('Location: mindrecorder.php');
}
*/
