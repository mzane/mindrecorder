<?php
require_once("app/model/server.inc.php");
require_once($serverPathController."Cookie.php");
require_once($serverPathController."Logout.php");

// Get users email for input
$userEmail = "";
if (isset($_COOKIE["mindCookieUserEmail"]) && strpos($_COOKIE["mindCookieUserEmail"], "mindEmail") === 0) {
	$userEmail = str_replace("mindEmail", "", $_COOKIE["mindCookieUserEmail"]);
}
?>
<!DOCTYPE html>
<html lang="de">
	<head>
		<title>MIND recorder - Zeichnen Sie Ihre Gedanken auf!</title>
		<meta charset="utf-8">
		<link rel="icon" href="static/img/common/favicon.ico" type="image/x-icon">
		<link rel="shortcut icon" href="static/img/common/favicon.ico" type="image/x-icon">
		<meta name="robots" content="all,noodp,noydir,index,follow">
		<link rel="image_src" href="static/img/common/logo-100x75.gif">
		<link rel="stylesheet" href="static/css/startpage.css">
		<link rel="stylesheet" href="static/js/plugins/jquery-ui/css/redmond/jquery-ui-1.8.custom.css">
		<script type="text/javascript" src="static/js/plugins/jquery-1.4.2.min.js"></script>
		<script type="text/javascript" src="static/js/plugins/swfobject.js"></script>
	</head>
	<body class="no-js">
		<script type="text/javascript">
			if (!$.browser.msie) {
				$("body").removeClass("no-js");
			} else {
				$(function() {
					$("#ie-hint").text("Sie benutzen den Internet Explorer? Bitte benutzen Sie einen anderen Browser wie Firefox oder Google Chrome!").show();
				});
			}
		</script>
		<div id="wrapper">
			<div id="header">
				<h1 id="logo" title="MIND recorder - Zeichnen Sie Ihre Gedanken auf!">MIND recorder - Zeichnen Sie Ihre Gedanken auf!</h1>
				<span id="claim" lang="en">What's on your mind?</span>
			</div>
			<noscript>Bitte aktivieren Sie JavaScript in Ihrem Browser, um den Service nutzen zu k&ouml;nnen!</noscript>
			<div id="body">
				<div id="content">
					<h2>Features von MIND recorder:</h2>
					<ul>
						<li>Neue Gedanken mit nur einem Klick anlegen</li>
						<li>Dateien mit wenigen Klicks hochladen und zu Gedanken hinzuf&uuml;gen</li>
						<li>Gedanken mit Labels versehen, um diese schnell zu finden</li>
					</ul>
					<p><a href="#mind-intro-video" id="link-mind-intro-video" class="bold">&rArr; Das Einf&uuml;hrungsvideo zu MIND recorder ansehen!</a></p>
					<p class="forkme"><a href="https://github.com/mzane/mindrecorder" target="_blank">Fork me on github!</a></p>
					<div id="md-mind-intro-video" title="Einf&uuml;hrungsvideo zu MIND recorder">
						<script type="text/javascript">
							swfobject.embedSWF("http://www.youtube.com/v/O2MfEHhczH4?fs=1&amp;hl=de_DE&amp;rel=0", "mind-intro-video", "640", "510", "9.0.0", "static/swf/expressInstall.swf");
						</script>
						<div id="mind-intro-video"></div>
					</div>
					<p id="ie-hint" style="background-color: #D99E32; display: none; font-weight: bold; padding: 2px;"></p>
					<img src="static/img/startpage/jewel.jpg" alt="Copyright by Ben Heine" title="Copyright by Ben Heine" style="width: 452px; height: 191px;">
				</div>
				<div id="form">
					<ul>
						<li><a href="#form-login" id="tab-login">Login</a></li>
						<li><a href="#form-reg" id="tab-reg">Registrierung</a></li>
					</ul>
					<div id="form-login">
						<form action="#" method="post">
							<fieldset>
								<legend>Login</legend>
								<label for="login-email">E-Mail-Adresse:</label>
								<input type="text" name="login-email" value="<?php echo $userEmail; ?>" id="login-email" class="required email">
								<label for="login-password">Passwort:</label>
								<input type="password" name="login-password" id="login-password" class="required" minlength="5">
								<button type="submit">Login</button>
							</fieldset>
						</form>
						<p>Alle Felder sind Pflichtfelder</p>
						<a href="#" id="pw-forgot">Passwort vergessen?</a>
						<div id="pw-forgot-form" title="Neues Passwort anfordern">
							<form action="#" method="post">
								<fieldset>
									<legend>Passwort anfordern</legend>
									<p>Bitte geben Sie Ihre im System hinterlegte E-Mail-Adresse an. Wir werden Ihnen ein neues Passwort ausstellen.</p>
									<label for="pw-email">E-Mail-Adresse:</label>
									<input type="text" name="pw-email" id="pw-email" class="required email">
									<button type="submit">Passwort anfordern</button>
								</fieldset>
							</form>
						</div>

						<div id="pw-forgot-result" title="Ihr neues Passwort">
							<p></p>
						</div>
					</div>
					<div id="form-reg">
						<form action="#" method="post">
							<fieldset>
								<legend>Registrierung</legend>
								<label for="reg-firstname">Vorname:</label>
								<input type="text" name="reg-firstname" id="reg-firstname" class="required" tabindex="1">
								<label for="reg-lastname">Nachname:</label>
								<input type="text" name="reg-lastname" id="reg-lastname" class="required" tabindex="2">
								<label for="reg-email">E-Mail-Adresse:</label>
								<input type="text" name="reg-email" id="reg-email" class="required email" tabindex="3">
								<label for="reg-password">Passwort (mind. 5 Zeichen):</label>
								<input type="password" name="reg-password" id="reg-password" class="required" minlength="5" tabindex="4">
								<label for="reg-captcha">Sicherheitscode: (<a href="#" id="reload-captcha">neu laden</a>)</label>
								<input type="text" name="reg-captcha" id="reg-captcha" class="required" style="margin-bottom: 6px;" tabindex="5">
<?php
$date = date("Ymd");
$rand = rand(0,9999999999999);
$height = "60";
$width  = "281";
$img    = "$date$rand-$height-$width.jpgx";
echo "<input type='hidden' name='reg-captcha-img' id='reg-captcha-img' value='$img'>";
echo "<p style='text-align: center; margin-bottom: 2px;'><a href='http://www.opencaptcha.com' target='_blank' title='Sicherheitscode von opencaptcha.com'><img src='http://www.opencaptcha.com/img/$img' height='$height' alt='Sicherheitscode' width='$width' id='reg-captcha-img-img' /></a></p>";
?>
								<label for="reg-hp" class="off">Adresse:</label>
								<input type="text" name="reg-hp" id="reg-hp" class="off">
								<p style="float: left; width: 150px;">Alle Felder sind Pflichtfelder</p>
								<button type="submit" tabindex="6">Registrieren</button>
							</fieldset>
						</form>
					</div>
					<div id="loading">l&auml;dt &hellip;</div>
					<div id="splash"></div>
				</div>
			</div>
			<div id="footer">
				<a href="#" id="imprint-link">Impressum und Kontakt</a>
				<div id="imprint" title="Impressum und Kontakt">
					<p>Inhaber und Betreiber dieses Dienstes:<br><strong>Matthias Krumm,<br />matthiaskrumm [&auml;t] mindrecorder [punkt] net</strong></p>
					<p>Der Inhaber ist nicht f&uuml;r den Inhalt der Nutzer verantwortlich. Der Inhaber distanziert sich ausdr&uuml;cklich von den Inhalten der Nutzer.</p>
				</div>
				<iframe id="fb" src="http://www.facebook.com/plugins/like.php?href=http%3A%2F%2Fmindrecorder.net%2F&amp;layout=standard&amp;show_faces=false&amp;width=320&amp;action=like&amp;colorscheme=light&amp;height=35" style="border:none; overflow:hidden; width:320px; height:35px;"></iframe>
			</div>
		</div>

		<script type="text/javascript" src="static/js/plugins/jquery-ui/js/jquery-ui-1.8.custom.min.js"></script>
		<script type="text/javascript" src="static/js/plugins/jquery.validate/jquery.validate.min.js"></script>
		<script type="text/javascript" src="static/js/startpage.js"></script>
<?php
if ($userEmail !== "") {
?>
		<script type="text/javascript">
			$("#login-password").focus();
		</script>
<?php
}
?>

		<script type="text/javascript">
			var _gaq = _gaq || [];
			_gaq.push(['_setAccount', 'UA-21543149-1']);
			_gaq.push(['_trackPageview']);

			(function() {
				var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
				ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
				var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
			})();
		</script>
	</body>
</html>