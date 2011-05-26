<?php
// We logout the user everytime he visits the index page, so there won't be a mix-up of wrong sessions
$cookie = new Cookie;
$cookie->deleteLoginCookie();

$_SESSION["login"] = false;
$_SESSION["userid"] = null;
$_SESSION["firstName"] = null;
$_SESSION["lastName"] = null;
$_SESSION["email"] = null;
$_SESSION["rights"] = null;
$_SESSION["activated"] = null;
session_destroy();
