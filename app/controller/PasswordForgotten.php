<?php
include_once("../model/server.inc.php");


class PasswordForgotten {
	// Create random password (http://www.totallyphp.co.uk/code/create_a_random_password.htm)
	private function createRandomPassword() {
		$chars = "abcdefghijkmnopqrstuvwxyz023456789";
		srand((double)microtime()*1000000);
		$i = 0;
		$pass = '' ;

		while ($i <= 7) {
			$num = rand() % 33;
			$tmp = substr($chars, $num, 1);
			$pass = $pass . $tmp;
			$i++;
		}

		return $pass;
	}

	public function doPasswordForgotten($email, $db_user) {
		$email = mysql_real_escape_string($email);

		$query = "SELECT * FROM $db_user WHERE email='$email' LIMIT 1";
		$result = mysql_query($query);
		$data = mysql_fetch_array($result);

		if ($data) {
			// Destroy session + cookie
			session_destroy();
			include_once("Cookie.php");
			$cookie = new Cookie;
			$cookie->deleteLoginCookie();

			// Create new password
			$newPassword = $this->createRandomPassword();
			$npDatabase = md5($newPassword);
			$query = "UPDATE $db_user SET password='$npDatabase' WHERE email='$email' LIMIT 1";
			$result = mysql_query($query);

			// Return success-message and password
			echo "mind-pw-success=".$newPassword."||";
		} else {
			echo "mind-pw-userUnknown";
		}
	}
}


// Password forgotten process
if (isset($_POST["pw-email"])) {
	$passwordForgotten = new PasswordForgotten;
	$passwordForgotten->doPasswordForgotten($_POST["pw-email"], $db_user);
}
