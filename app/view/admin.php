<?php
include_once("app/model/server.inc.php");

// Redirect back to login page if there is no session available
if (!$_SESSION["login"] || $_SESSION["rights"] < 99) {
	header("Location: index.php");
}
?>
<!DOCTYPE html>
<html lang="de">
	<head>
		<title>MIND recorder - Administration</title>
		<meta charset="utf-8">
		<meta name="robots" content="all,noodp,noydir,noindex,nofollow">
		<link rel="icon" href="static/img/common/favicon.ico" type="image/x-icon">
		<link rel="shortcut icon" href="static/img/common/favicon.ico" type="image/x-icon">

		<link rel="stylesheet" href="static/js/plugins/jquery-ui/css/redmond/jquery-ui-1.8.custom.css" />
		<link rel="stylesheet" href="static/css/app.css" />

		<script type="text/javascript" src="static/js/plugins/jquery-1.4.2.min.js"></script>
		<script type="text/javascript" src="static/js/plugins/jquery-ui/js/jquery-ui-1.8.custom.min.js"></script>
		<script type="text/javascript" src="static/js/plugins/jquery.validate/jquery.validate.min.js"></script>
	</head>

	<body id="adminpage">
		<div id="header">
			<img src="static/img/common/logo.gif" alt="MIND recorder (Logo)" title="MIND recorder - Zeichnen Sie Ihre Gedanken auf!" style="width: 110px; height: 61px;" id="logo" />
			<div id="hdr-search">
				<form action="#" method="post">
					<fieldset>
						<legend>Benutzersuche</legend>
						<label for="hdr-search-input" title="Suche nach Benutzern">Benutzersuche:</label>
						<input type="text" name="hdr-search" id="hdr-search-input" title="Bitte Name eingeben" />
					</fieldset>
				</form>
			</div>

			<ul id="hdr-links">
				<li><a href="index.php" id="hdr-logout" title="von MIND recorder abmelden">Abmelden</a></li>
			</ul>
		</div>

		<div id="label-list">
<?php
// Show all user
$queryUser = "SELECT * FROM $db_user WHERE rights='0' ORDER BY id ASC";
$resultUser = mysql_query($queryUser);
?>
			<div id="ll-head">
				<h2>Benutzer (<?php echo mysql_num_rows($resultUser) ?>)</h2>
			</div>
			<div id="ll-cnt">
				<ul>
<?php
if (@mysql_num_rows($resultUser)) {
	while ($rowUser = mysql_fetch_array($resultUser)) {
		$userId = $rowUser["id"];
		$queryLabelsUser = "SELECT * FROM $db_labels WHERE userId='$userId'";
		$resultLabelsUser = mysql_query($queryLabelsUser);
		$queryThoughtsUser = "SELECT * FROM $db_thoughts WHERE userId='$userId'";
		$resultThoughtsUser = mysql_query($queryThoughtsUser);
		$queryObjectsUser = "SELECT * FROM $db_objects WHERE userId='$userId'";
		$resultObjectsUser = mysql_query($queryObjectsUser);
?>
					<li><a href="#user-<?php echo $userId ?>"><?php if ($rowUser["activated"] == "0") {echo '<strong class="deactive" title="Benutzer deaktiviert">!</strong> ';} ?><?php echo $rowUser["firstName"] ?> <?php echo $rowUser["lastName"] ?> (<?php echo mysql_num_rows($resultLabelsUser) ?>/<?php echo mysql_num_rows($resultThoughtsUser) ?>/<?php echo mysql_num_rows($resultObjectsUser) ?>)</a></li>
<?php
	}
}
?>
				</ul>
			</div>

			<div id="ll-loading" style="display: none;">l&auml;dt &hellip;</div>
		</div>

		<div id="workspace">
			<div id="canvas-tools">
				<div id="t-main">
					<button id="main-save" name="main-save" title="Gedanke speichern">Speichern</button>
				</div>
			</div>

			<div id="content">
				<div id="content-default">
<?php
$queryLabels = "SELECT * FROM $db_labels";
$resultLabels = mysql_query($queryLabels);
$queryThoughts = "SELECT * FROM $db_thoughts";
$resultThoughts = mysql_query($queryThoughts);
$queryObjects = "SELECT * FROM $db_objects";
$resultObjects = mysql_query($queryObjects);
?>
					<h1>Benutzerstatistik</h1>
					<dl>
						<dt>Benutzer:</dt>
						<dd id="statistics-user"><?php echo mysql_num_rows($resultUser) ?></dd>
						<dt>Label:</dt>
						<dd id="statistics-label"><?php echo mysql_num_rows($resultLabels) ?></dd>
						<dt>Gedanken:</dt>
						<dd id="statistics-thoughts"><?php echo mysql_num_rows($resultThoughts) ?></dd>
						<dt>Objekte:</dt>
						<dd id="statistics-objects"><?php echo mysql_num_rows($resultObjects) ?></dd>
					</dl>
				</div>
				<div id="content-user">
					<form action="#" method="post">
						<fieldset>
							<legend>Benutzerdaten bearbeiten</legend>
							<dl>
								<dt>ID:</dt>
								<dd id="statistics-user-id"></dd>
							</dl>
							<p><label for="user-activated">Aktiviert:</label> <input type="checkbox" name="user-activated" id="user-activated" value=""></p>
							<p><label for="user-firstname">Vorname:</label> <input type="text" name="user-firstname" id="user-firstname" value=""></p>
							<p><label for="user-lastname">Nachname:</label> <input type="text" name="user-lastname" id="user-lastname" value=""></p>
							<p><label for="user-email">E-Mail:</label> <input type="text" name="user-email" id="user-email" value=""></p>
							<p><label for="user-password">Passwort:</label> <input type="password" name="user-password" id="user-password" value=""> (mind. 5 Zeichen)</p>
						</fieldset>
						<input type="hidden" name="user-id" id="user-id" value="">
						<input type="hidden" name="user-password-md5" id="user-password-md5" value="">
					</form>

					<h2>Statistik des Benutzers</h2>
					<dl>
						<dt>Label:</dt>
						<dd id="statistics-user-label"></dd>
						<dt>Gedanken:</dt>
						<dd id="statistics-user-thoughts"></dd>
						<dt>Objekte:</dt>
						<dd id="statistics-user-objects"></dd>
						<dt>Verbrauch Speicherplatz:</dt>
						<dd id="statistics-user-filesize"></dd>
					</dl>
				</div>
			</div>
		</div>

		<div id="system-tray">
			<ul>

			</ul>
		</div>


		<div id="md-user-deactivate" title="Benutzer deaktivieren?">
			<p><strong>M&ouml;chten Sie den Benutzer wirklich deaktivieren?</strong></p>
		</div>


		<script type="text/javascript" src="static/js/adminpage.js"></script>

	</body>
</html>