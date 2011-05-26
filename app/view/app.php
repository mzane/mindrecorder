<?php
include_once("app/model/server.inc.php");

// Redirect back to login page if there is no session available
if (!$_SESSION["login"] || $_SESSION["activated"] == "0") {
	header('Location: index.php');
}
?>
<!DOCTYPE html>
<html lang="de">
	<head>
		<title>MIND recorder</title>
		<meta charset="utf-8">
        <link rel="icon" href="static/img/common/favicon.ico" type="image/x-icon">
        <link rel="shortcut icon" href="static/img/common/favicon.ico" type="image/x-icon">
		<meta name="robots" content="all,noodp,noydir,noindex,nofollow">

		<link rel="stylesheet" href="static/js/plugins/jquery-ui/css/redmond/jquery-ui-1.8.custom.css" />
		<link rel="stylesheet" href="static/js/plugins/lwrte/jquery.rte.css" />
		<link rel="stylesheet" href="static/css/app.css" />

		<script type="text/javascript" src="static/js/plugins/jquery-1.4.2.min.js"></script>
		<script type="text/javascript" src="static/js/plugins/jquery-ui/js/jquery-ui-1.8.custom.min.js"></script>
		<script type="text/javascript" src="static/js/plugins/mlcolorpicker/jquery.mlcolorpicker.js"></script>
		<script type="text/javascript" src="static/js/plugins/jquery.validate/jquery.validate.min.js"></script>

		<script type="text/javascript" src="static/js/plugins/lwrte/jquery.rte.js"></script>
		<script type="text/javascript" src="static/js/plugins/lwrte/jquery.rte.tb.js"></script>

		<!--<script type="text/javascript" src="static/js/plugins/swfobject.js"></script>-->
	</head>

	<body>
		<div id="header">
			<img src="static/img/common/logo.gif" alt="MIND recorder (Logo)" title="MIND recorder - Zeichnen Sie Ihre Gedanken auf!" style="width: 110px; height: 61px;" id="logo" />
			<div id="hdr-search">
				<form action="#" method="post">
					<fieldset>
						<legend>Gedankensuche</legend>
						<label for="hdr-search-input" title="Suche nach Objekten">Gedankensuche:</label>
						<input type="text" name="hdr-search" id="hdr-search-input" title="Bitte Suchbegriff eingeben" />
					</fieldset>
				</form>
			</div>
			<div id="hdr-breadcrumb" title="Sie sind hier:">
				<span id="hdr-b-label">-leer-</span> &gt; <span id="hdr-b-thought">-kein Label-</span>
			</div>
			<ul id="hdr-links">
				<li><a href="#user-settings" title="zu meinen Daten" id="hdr-user-settings">Hallo <span><?php echo $_SESSION["firstName"] ?></span>!</a></li>
				<li><a href="#feedback" title="Feedback geben!" id="hdr-feedback">Feedback geben!</a></li>
<!--				<li><a href="#game" title="Spiel spielen" id="hdr-game">Spiel</a></li>-->
				<li><a href="#about" title="&uuml;ber MIND recorder" id="hdr-about">&Uuml;ber</a></li>
				<li><a href="index.php" title="von MIND recorder abmelden" id="hdr-logout">Abmelden</a></li>
			</ul>
		</div>

		<div id="label-list">
			<div id="ll-head">
				<h2>Label <button id="label-new" title="Neues Label">Neu</button></h2>
			</div>
			<div id="ll-cnt">
				<ul id="ll-cnt-main">
					<!--<li class="active" id="label-0"><a href="#label-0">Willkommens-Label</a></li>-->
				</ul>
				<hr class="divider" />
				<ul id="ll-cnt-sub">
					<li id="label-999999990"><a href="#label-999999990">-kein Label-</a></li>
					<!--<li id="label-999999991"><a href="#label-999999991">Gedanken</a></li>-->
					<!--<li id="label-999999992"><a href="#label-999999992">Dateien</a></li>-->
					<!--<li id="label-999999993"><a href="#label-999999993">Kontakte</a></li>-->
					<li id="label-999999999"><a href="#label-999999999">Papierkorb</a></li>
				</ul>
			</div>
			<div id="ll-loading" style="display: none;">l&auml;dt &hellip;</div>
			<div id="ll-handler"><a href="#" title="Label-Liste &ouml;ffnen/schlie&szlig;en">&ouml;ffnen/schlie&szlig;en</a></div>
		</div>

		<div id="object-list">
			<div id="ol-head">
				<h2>Gedanken <button id="new-thought" title="Neuer Gedanke">Neu</button></h2>
				<!--<a href="#" id="ol-aux">Sortieren</a>-->
				<!--<a href="#" id="ol-aux">Alle markieren</a>-->
			</div>
			<div id="ol-cnt">
				<ul>
					
				</ul>
			</div>
			<div id="ol-loading" style="display: none;">l&auml;dt &hellip;</div>
			<div id="ol-handler"><a href="#" title="Objekt-Liste &ouml;ffnen/schlie&szlig;en">&ouml;ffnen/schlie&szlig;en</a></div>
		</div>

		<div id="workspace">
			<div id="canvas-tools">
				<div id="t-main">
					<button id="main-save" name="main-save" title="Gedanke speichern">Speichern</button>
					<input type="checkbox" id="main-autosave" checked="checked" /><label for="main-autosave" title="Autospeichern ein-/ausschalten">Autospeichern</label>
				</div>
				<div id="t-upload">
					<button id="upload-main" name="upload-main" title="Dateien hochladen">Hochladen</button>
				</div>
				<div id="t-tools">
					<input type="radio" id="tool-default" name="canvas-tools" checked="checked" /><label for="tool-default" title="Standardwerkzeug/Verschieben">Standard</label>
					<input type="radio" id="tool-text" name="canvas-tools" /><label for="tool-text" title="Text einf&uuml;gen">Text</label>
					<input type="radio" id="tool-link" name="canvas-tools" /><label for="tool-link" title="Hyperlink einf&uuml;gen">Link</label>
					<input type="radio" id="tool-pen" name="canvas-tools" /><label for="tool-pen" title="Mit Stift zeichnen">Stift</label>
					<input type="radio" id="tool-rectangle" name="canvas-tools" /><label for="tool-rectangle" title="Rechteck einf&uuml;gen">Rechteck</label>
					<input type="radio" id="tool-circle" name="canvas-tools" /><label for="tool-circle" title="Kreis einf&uuml;gen">Kreis</label>
					<input type="radio" id="tool-eraser" name="canvas-tools" /><label for="tool-eraser" title="Objekte von Arbeitsfl&auml;che entfernen">Radiergummi</label>
				</div>
				<div id="t-props">
					<button id="thickness-line"><span></span> Linienst&auml;rke</button>
					<button id="color-line"><span></span> Linienfarbe</button>
					<button id="color-fill"><span></span> F&uuml;llfarbe</button>
				</div>
				<div id="t-canvas">
					<!--<input type="checkbox" id="canvas-move" /><label for="canvas-move">Zeichenmappe verschieben</label>-->
					<input type="checkbox" id="canvas-grid" /><label for="canvas-grid" title="Hilfslinien ein-/ausblenden">Hilfslinien</label>
					<button id="canvas-color" title="Arbeitsfl&auml;che f&auml;rben">F&auml;rben</button>
					<button id="canvas-empty" title="Arbeitsfl&auml;che leeren">Leeren</button>
				</div>
			</div>
			<!--<div id="canvas-tabs"> jQuery UI-Tabs original markup
				<ul>
					<li><a href="#canvas-48">Willkommen bei MIND recorder!</a> <span class="ui-icon ui-icon-close" title="Tab schlie&szlig;en">Tab schlie&szlig;en</span></li>
					<li><a href="#canvas-new" title="Neuer Gedanke">Neu</a></li>
				</ul>
			</div>-->
			<div id="canvas-tabs" class="ui-tabs ui-widget ui-widget-content ui-corner-all">
				<ul class="ui-tabs-nav ui-helper-reset ui-helper-clearfix ui-widget-header ui-corner-all">
					<!--<li class="ui-state-default ui-corner-top ui-tabs-selected ui-state-active"><a href="#canvas-48">Willkommen bei MIND recorder!</a> <span title="Tab schließen" class="ui-icon ui-icon-close">Tab schließen</span></li>-->
					<!--<li id="tab-new" class="ui-state-default ui-corner-top ui-tabs-selected ui-state-active"><a title="Neuer Gedanke" href="#canvas-9999999999">Neu</a></li>-->
				</ul>
			</div>
			<div id="canvas-wrapper">
				<!--<div class="canvas" id="canvas-48"></div>-->
				<!--<div class="canvas" id="canvas-9999999999"></div>-->
			</div>
			<!-- Form for saving canvas' content -->
			<form action="#" id="canvas-content-pusher">
				<label for="canvas-content-pusher-content" class="canvas-content-pusher-content">ccp</label><textarea cols="1" rows="1" name="canvas-content-pusher-content" class="canvas-content-pusher" id="canvas-content-pusher-content"></textarea>
			</form>

			<div id="workspace-miniature">
				<div id="workspace-miniature-clip"></div>
			</div>

			<div id="chat">
				<div id="chat-collaborate"><a href="#">Bearbeitung &uuml;bernehmen</a></div>
				<div id="chat-cnt">
					<dl>
						<!--<dt class="chat-contact">Seppl:</dt>
						<dd>Was geht?</dd>-->
					</dl>
				</div>
				<form action="#" method="post">
					<fieldset>
						<legend>Chat</legend>
						<label for="chat-mytext">Ich:</label>
						<input type="text" name="chat-mytext" id="chat-mytext" />
						<button type="submit">OK</button>
					</fieldset>
					<div id="chat-close"><a href="javascript://;" title="Chat schlie&szlig;en"><span class="ui-icon ui-icon-close">Chat schlie&szlig;en</span></a></div>
				</form>
			</div>
		</div>

		<div id="system-tray">
			<ul>
				<!--<li class="message-success">Gedanke erfolgreich angelegt</li>-->
			</ul>
		</div>


		<div id="modal-dialogs">
			<div id="md-canvas-empty" title="Arbeitsfl&auml;che leeren?">
				<p><strong>M&ouml;chten Sie die Arbeitsfl&auml;che wirklich leeren?</strong></p>
				<p>Dieser Schritt kann nicht r&uuml;ckg&auml;ngig gemacht werden.</p>
			</div>

			<div id="md-label-delete" title="Label wirklich l&ouml;schen?">
				<p><strong>M&ouml;chten Sie das Label wirklich l&ouml;schen? Eventuell vorhandene Gedanken werden in den Papierkorb verschoben.</strong></p>
				<p>Dieser Schritt kann nicht r&uuml;ckg&auml;ngig gemacht werden.</p>
			</div>

			<div id="md-new-label" title="Neues Label anlegen">
				<form method="post" action="#">
					<label for="new-label-name">Labelname:</label>
					<input type="text" name="new-label-name" id="new-label-name" class="required grouping" />
					<label for="new-label-filter-type" class="off">Labelfilter (Dateityp):</label>
					<select name="new-label-filter-type" id="new-label-filter-type" class="off">
						<option value="-1">-kein Dateityp-</option>
						<option value="word">Word</option>
						<option value="img-jpg">Bild jpg</option>
						<option value="img-gif">Bild gif</option>
						<option value="img-bmp">Bild bmp</option>
					</select>
				</form>
			</div>

			<div id="md-edit-label" title="Label bearbeiten">
				<form method="post" action="#">
					<label for="edit-label-name">Labelname:</label>
					<input type="text" name="edit-label-name" id="edit-label-name" class="required grouping" />
					<label for="edit-label-filter-type" class="off">Labelfilter (Dateityp):</label>
					<select name="edit-label-filter-type" id="edit-label-filter-type" class="off">
						<option value="-1">-kein Dateityp-</option>
						<option value="word">Word</option>
						<option value="img-jpg">Bild jpg</option>
						<option value="img-gif">Bild gif</option>
						<option value="img-bmp">Bild bmp</option>
					</select>
				</form>
			</div>

			<div id="md-object-delete" title="Objekt wirklich l&ouml;schen?">
				<p><strong>M&ouml;chten Sie das Objekt wirklich l&ouml;schen?</strong></p>
				<p>Dieser Schritt kann nicht r&uuml;ckg&auml;ngig gemacht werden.</p>
			</div>

			<div id="md-thought-delete" title="Gedanke wirklich l&ouml;schen?">
				<p><strong>M&ouml;chten Sie den Gedanken wirklich l&ouml;schen? Eventuell vorhandene Objekte werden ebenso gel&ouml;scht.</strong></p>
				<p>Dieser Schritt kann nicht r&uuml;ckg&auml;ngig gemacht werden.</p>
			</div>

			<div id="md-save-thought" title="Gedanke speichern?">
				<p><strong>M&ouml;chten Sie den Gedanken vor dem Schlie&szlig;en speichern?</strong></p>
			</div>

			<div id="md-new-thought" title="Neuen Gedanken anlegen">
				<form method="post" action="#">
					<label for="new-thought-name">Gedankenname:</label>
					<input type="text" name="new-thought-name" id="new-thought-name" />
					<label for="new-thought-label">Label:</label>
					<select name="new-thought-label" id="new-thought-label" class="grouping">

					</select>
					<label for="new-thought-desc" class="optional">Beschreibung (optional):</label>
					<input type="text" name="new-thought-desc" id="new-thought-desc" />
					<input type="hidden" name="new-thought-content" id="new-thought-content" value="" />
				</form>
			</div>

			<div id="md-edit-thought" title="Gedanken bearbeiten">
				<form method="post" action="#">
					<label for="edit-thought-name">Gedankenname:</label>
					<input type="text" name="edit-thought-name" id="edit-thought-name" />
					<label for="edit-thought-label">Label:</label>
					<select name="edit-thought-label" id="edit-thought-label" class="grouping">

					</select>
					<label for="edit-thought-desc" class="optional">Beschreibung (optional):</label>
					<input type="text" name="edit-thought-desc" id="edit-thought-desc" />
				</form>
			</div>

			<div id="md-upload" title="Datei hochladen">
				<form method="post" action="<?php echo $serverPathController ?>Objects.php" enctype="multipart/form-data" target="hidden-new-upload-target">
					<label for="new-upload-file">Datei ausw&auml;hlen:</label>
					<input type="file" name="new-upload-file" id="new-upload-file" size="31">

					<label for="new-upload-desc" class="optional">Beschreibung (optional):</label>
					<input type="text" name="new-upload-desc" id="new-upload-desc" />

					<p>Maximale Dateigr&ouml;&szlig;e: 2 MB</p>

					<input type="hidden" name="new-upload-thoughtId" id="new-upload-thoughtId" value="">
				</form>
			</div>

			<div id="md-new-link" title="Link einf&uuml;gen">
				<form method="post" action="#">
					<label for="new-link-url">Link:</label>
					<input type="text" name="new-link-url" id="new-link-url" value="http://" />
					<label for="new-link-name">Linkname:</label>
					<input type="text" name="new-link-name" id="new-link-name" />
				</form>
			</div>


			<div id="md-user-settings" title="Meine Daten bearbeiten">
				<form method="post" action="#">
					<label for="user-firstname">Vorname:</label>
					<input type="text" name="user-firstname" id="user-firstname">
					<label for="user-lastname">Nachname:</label>
					<input type="text" name="user-lastname" id="user-lastname">
					<label for="user-email">E-Mail-Adresse:</label>
					<input type="text" name="user-email" id="user-email">
					<label for="user-password" class="optional">Passwort (optional, mind. 5 Zeichen):</label>
					<input type="password" name="user-password" id="user-password" class="grouping">

					<h2>Meine pers&ouml;nliche Statistik</h2>
					<dl>
						<dt>Label:</dt>
						<dd id="statistics-user-label"></dd>
						<dt>Gedanken:</dt>
						<dd id="statistics-user-thoughts"></dd>
						<dt>Objekte:</dt>
						<dd id="statistics-user-objects"></dd>
						<dt>Verbrauchter Speicherplatz:</dt>
						<dd id="statistics-user-filesize"></dd>
						<div style="clear: both;"></div>
					</dl>

					<hr>
					<input type="checkbox" name="user-activated" id="user-activated" value="">
					<label for="user-activated" style="color: #888; display: inline; font-weight: normal;">Ich m&ouml;chte meinen Account unwiderruflich l&ouml;schen</label>

					<input type="hidden" name="user-password-md5" id="user-password-md5" value="">
				</form>
			</div>

			<div id="md-user-deactivate" title="Account l&ouml;schen?">
				<p><strong>M&ouml;chten Sie Ihren Account wirklich l&ouml;schen?<br>Dieser Schritt kann nicht r&uuml;ckg&auml;ngig gemacht werden!</strong></p>
				<p>Wenn Sie mit &quot;Ja&quot; best&auml;tigen, werden Sie sofort ausgeloggt und Ihr Account gel&ouml;scht.</p>
			</div>


			<div id="md-feedback" title="Feedback geben!">
				<h2>Ihre Meinung ist uns wichtig!</h2>
				<p>MIND recorder ist noch nicht vollst&auml;ndig ausgereift. Daher bitten wir Sie um Mithilfe! Was gef&auml;llt Ihnen gut, was nicht gut? Was k&ouml;nnen wir besser machen?</p>
				<p class="grouping">Schreiben Sie uns, was Sie von MIND recorder halten!</p>
				<form method="post" action="#">
					<label for="feedback-msg">Ihr Feedback:</label>
					<textarea name="feedback-msg" id="feedback-msg" rows="5" cols="40"></textarea>
				</form>
			</div>

			<!--<div id="md-game" title="Ein Spiel spielen">
				<script type="text/javascript">
					swfobject.embedSWF("static/swf/game.swf", "md-game-flash-alternative", "550", "400", "9.0.0", "static/swf/expressInstall.swf");
				</script>
				<div id="md-game-flash-alternative">Das Spiel kann nicht angezeigt werden, da Sie wahrscheinlich kein Flash installiert haben.</div>
			</div>-->

			<div id="md-about" title="&Uuml;ber MIND recorder">
				<h2>&Uuml;ber MIND recorder</h2>
				<p>MIND recorder wurde ins Leben gerufen, um eine schnelle und einfach zu handhabende M&ouml;glichkeit zu bieten, die eigenen Gedanken festzuhalten. Dabei sollen Gedanken nicht verloren gehen sondern flie&szlig;en.</p>
				
				<h2>Impressum</h2>
				<p>Inhaber und Betreiber dieses Dienstes:<br><strong>Matthias Krumm,<br />matthiaskrumm [&auml;t] mindrecorder [punkt] net</strong></p>
				<p>Der Inhaber ist nicht f&uuml;r den Inhalt der Nutzer verantwortlich. Der Inhaber distanziert sich ausdr&uuml;cklich von den Inhalten der Nutzer.</p>
			</div>
		</div>

		<script type="text/javascript" src="static/js/app.js"></script>

		<iframe src="<?php echo $serverPathView ?>broker.php" id="broker"></iframe>
		<iframe id="hidden-new-upload-target" name="hidden-new-upload-target" src="#"></iframe>

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