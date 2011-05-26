<?php
include_once("../model/server.inc.php");



class Feedback {
	// Handle filetypes
	public function newFeedback($feedbackMsg) {
		if (isset($feedbackMsg)) {
			$feedbackMsg = htmlspecialchars($feedbackMsg);

			$mailContent = "Von UserId: ".$_SESSION["userid"]."\nFeedback:\n".$feedbackMsg;
			$recipient = "matthiaskrumm@mindrecorder.net";
			$subject = "MIND recorder - Neues Feedback";
			$header = "From: ".$recipient." <".$recipient.">\r\n";
			mail($recipient, $subject, $mailContent, $header);

			echo '{"result": "success"}';
		} else {
			echo '{"result": "error"}';
		}
	}
}


// Handle filetypes
if (isset($_GET["action"]) && $_GET["action"] === "newFeedback") {
	$feedback = new Feedback;
	$feedback->newFeedback($_POST["feedback-msg"]);
}