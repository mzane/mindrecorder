<?php
class Cookie {
	public function setLoginCookie($data) {
		setcookie("mindCookieUserEmail", "mindEmail".$data["email"], time()+60*60*24*30); // expires in 30 days and won't get deleted

		// todo: currently not working
//	    setcookie("mindSessionCookie", "mindUser".$data["id"], time()+60*60*24*30);
	}

	public function deleteLoginCookie() {
//	    setcookie("mindSessionCookie", "", time() - 3600);
	}
}
