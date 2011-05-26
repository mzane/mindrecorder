<?php
include_once("../model/server.inc.php");


class Registration {
	private function curler($url) {
		$ch= curl_init();
		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_TIMEOUT, 60);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);

		// execute Curl and save result
		$response= curl_exec($ch);
		$curl_error= curl_error($ch);

		return $response;
	}

	// Registration
	public function doRegistration($firstName, $lastName, $email, $password, $captcha, $captchaImg, $db_user, $serverPathUser, $db_labels, $db_thoughts) {
		$firstName = mysql_real_escape_string($firstName);
		$lastName = mysql_real_escape_string($lastName);
		$email = mysql_real_escape_string($email);
		$password = mysql_real_escape_string($password);
		$password = md5($password);

		// Check for existing e-mail addresses
		$query = "SELECT * FROM $db_user WHERE email='$email' LIMIT 1";
		$result = mysql_query($query);

		if (mysql_fetch_array($result)) {
			echo "mind-registration-emailAlreadyExists";
		} else {
			if ($this->curler("http://www.opencaptcha.com/validate.php?ans=".$captcha."&img=".$captchaImg) == "pass") {
				// Insert db-entry
				$query = "INSERT INTO $db_user (firstName,lastName,email,password,activated) VALUES ('$firstName','$lastName','$email','$password','1')";
				$result = mysql_query($query);

				// Make user dir
				$queryUD = "SELECT * FROM $db_user WHERE email='$email' AND password='$password' LIMIT 1";
				$resultUD = mysql_query($queryUD);
				$dataUD = mysql_fetch_array($resultUD);
				$userId = $dataUD["id"];
				mkdir("../../".$serverPathUser."".$userId, 0744, true);

				// Insert "Welcome"-label and -thought to the db
				include_once("Label.php");
				$label = new Label;
				$labelResponse = $label->newLabel($db_labels, "Willkommens-Label", null, $userId);
				$labelResponse = json_decode($labelResponse, true);
				$labelId = $labelResponse["values"]["id"];

				include_once("Thought.php");
				$thought = new Thought;
				$thoughtResponse = $thought->newThought($db_thoughts, $userId, "Willkommen bei MIND recorder!", '<span class="canvas-data-holder ui-draggable" data-save="saved" data-canvascolor="" data-zindex="4"></span><div style="border: medium none; left: 24px; top: 32px; z-index: 4; width: 443px; color: rgb(255, 204, 0); height: auto;" id="text-object-4" class="text-object ui-draggable"><font size="5">Willkommen bei MIND recorder!<br></font></div><div style="background-color: rgb(0, 0, 0); border-color: transparent; border-width: 2px; left: 21px; top: 73px; z-index: 5; width: 345px; height: 1px;" id="rectangle-object-5" class="rectangle-object ui-draggable"></div><div style="border: medium none; left: 24px; top: 92px; z-index: 10; width: 341px; height: auto;" id="text-object-10" class="text-object ui-draggable"><ul><li>Unter <b>Label</b> können Sie Ihre Label verwalten. In den Label werden die Gedanken gespeichert.</li><li>Unter <b>Gedanken</b> können Sie, abhängig vom gewählten Label, Ihre Gedanken verwalten. Zusätzlich werden hier auch die zu den Gedanken hochgeladenen Dateien verwaltet.</li><li>Hier im <b>Arbeitsbereich</b> zeichnen Sie Ihre Gedanken auf - mittels Text, Stift oder bspw. Rechteck-Malwerkzeug.<br></li></ul></div><div style="border: medium none; left: 34px; top: 247px; z-index: 3; width: 405px; height: auto; color: rgb(255, 255, 102);" id="text-object-11" class="text-object ui-draggable"><font size="4">Viel Spaß mit MIND recorder!</font><br></div><div style="background-color: rgb(0, 153, 255); border-color: rgb(0, 0, 0); border-width: 2px; left: 26px; top: 246px; z-index: 0; width: 249px; height: 31px;" id="rectangle-object-4" class="rectangle-object ui-draggable"></div>', $labelId, "Willkommens-Gedanke als Beispiel");
				$thoughtResponse = json_decode($thoughtResponse, true);
				$thoughtId = $thoughtResponse["values"]["id"];

				// Set session data
				$lastSession = '{"OpenLabel": "'.$labelId.'", "OpenThoughts": "999999999,'.$thoughtId.'", "OpenThought": "'.$thoughtId.'", "LabelListWidth": "140", "ObjectListWidth": "260"}';
				$querySessionData = "UPDATE $db_user SET lastSession='$lastSession' WHERE id='$userId' LIMIT 1";
				mysql_query($querySessionData);


				if ($result) {
					include_once("Login.php");
					$login = new Login;
					if ($login->doLogin($email, $password, $db_user)) {
						// Send welcome-mail
						$mailContent = "Herzlich willkommen bei MIND recorder!"."\n\n"."Ihre bei mindrecorder.net angegebene E-Mail-Adresse lautet:\n".$email."\n\n\n"."Herzlichst,"."\n"."Ihr Team von http://mindrecorder.net";
						$recipient = $email;
						$subject = "MIND recorder - Herzlich Willkommen!";
						$header = "From: info@mindrecorder.net <info@mindrecorder.net>\r\n";
						mail($recipient, $subject, $mailContent, $header);

						echo "mind-registration-success";
					} else {
						echo "mind-registration-error";
					}
				} else {
					echo "mind-registration-error";
				}
			} else {
				echo "mind-registration-captchaerror";
			}
		}
	}
}


// Registration
if (isset($_POST["reg-firstname"]) && isset($_POST["reg-lastname"]) && isset($_POST["reg-email"]) && isset($_POST["reg-password"]) && isset($_POST["reg-captcha"]) && isset($_POST["reg-captcha-img"]) && $_POST["reg-hp"] == "") {
	$registration = new Registration;
	$registration->doRegistration($_POST["reg-firstname"], $_POST["reg-lastname"], $_POST["reg-email"], $_POST["reg-password"], $_POST["reg-captcha"], $_POST["reg-captcha-img"], $db_user, $serverPathUser, $db_labels, $db_thoughts);
}
