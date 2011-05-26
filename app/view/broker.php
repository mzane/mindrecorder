<?php
include_once("../model/server.inc.php");
include_once("../controller/Thought.php");


// Die if there is no session available
if (!$_SESSION["login"]) {
	die();
}

// Get userid from session
$userId = $_SESSION["userid"];

// Get load info + id of which object to focus
$load = "";
$labelId = -1;
$objectId = -1;
$openObjectList = -1; // the thoughtId is actually passed so we know which list should be opened
if (isset($_GET["load"])) {
	if (isset($_GET["load"])) {
		$load = $_GET["load"];
	}
	if (isset($_GET["labelId"])) {
		$labelId = $_GET["labelId"];
	}
	if (isset($_GET["objectId"])) {
		$objectId = $_GET["objectId"];
	}
	if (isset($_GET["openObjectList"])) {
		$openObjectList = $_GET["openObjectList"];
	}
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="de" lang="de">
<head>
	<title>MIND recorder - Broker</title>
	<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
	<script type="text/javascript" src="../../static/js/plugins/jquery-1.4.2.min.js"></script>
	<script type="text/javascript">
		window.MINDbroker = new Object();

		// Insert html (source) at correct position (target)
		MINDbroker.addContentToParent = function(source, target) { // parameter source and target are only strings, not the jQuery objects
			var _sourceHTML = $(source).html();
			parent.$(target).empty().html(_sourceHTML);
		};
	</script>
</head>

<body>



<?php
if ($load === "labels" || $load === "") {
?>
	<!-- LABEL LIST ------------------------------------------------------------------------------------ -->
	<script type="text/javascript">
		parent.$("#ll-loading").show();
	</script>
	<div id="source-label-list">
<?php
	$query = "SELECT * FROM $db_labels WHERE userId='$userId' ORDER BY name ASC";
	$result = mysql_query($query);

	if (@mysql_num_rows($result)) {
		while ($row = mysql_fetch_array($result)) {
			$id = $row['id'];
?>
		<li<?php if ($id === $labelId) {echo ' class="active"';} ?> id="label-<?php echo $id ?>">
			<a href="#label-<?php echo $id ?>"><?php echo $row["name"] ?></a>
			<span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s" title="Optionen">Optionen</span>
		</li>
<?php
		}
	} else {
		echo '<li class="note-nocontent">-keine Label vorhanden; mit dem Button &quot;<strong>Neu</strong>&quot; k&ouml;nnen Sie ein neues Label anlegen-</li>';
	}
?>
	</div>
	<script type="text/javascript">
		MINDbroker.addContentToParent("#source-label-list", "#label-list #ll-cnt #ll-cnt-main");
		parent.MIND.LabelList.addEvents();
		parent.$("#ll-loading").hide();
	</script>
<?php
	if ($load === "labels") {
		$load = "thoughts";
	}
}
?>



<?php
if ($load === "thoughts" || $load === "") {
?>
	<!-- OBJECT LIST ------------------------------------------------------------------------------------ -->
	<script type="text/javascript">
		parent.$("#ol-loading").show();
	</script>
	<div id="source-object-list">
<?php
	$query = "SELECT * FROM $db_thoughts WHERE userId='$userId' AND labelId='$labelId' ORDER BY name ASC";
	$result = mysql_query($query);
	
	if (@mysql_num_rows($result)) {
		while ($row = mysql_fetch_array($result)) {
			$id = $row['id'];
			$desc = $row['description'];

			$queryObjects = "SELECT * FROM $db_objects WHERE userId='$userId' AND thoughtId='$id' ORDER BY name ASC";
			$resultObjects = mysql_query($queryObjects);
?>
<?php
			// If thought has objects
			if (@mysql_num_rows($resultObjects)) {
?>
		<li class="has-objects<?php if ($id === $objectId) {echo ' active';} ?>" id="thought-<?php echo $id ?>" data-labelid="<?php echo $row["labelId"] ?>">
			<div class="ol-has-objects-handler"><a href="#" title="Objektliste &ouml;ffnen/schlie&szlig;en"><span class="ui-icon ui-icon-circlesmall-plus">Objektliste &ouml;ffnen/schlie&szlig;en</span></a></div>
<?php
			} else {
?>
		<li<?php if ($id === $objectId) {echo ' class="active"';} ?> id="thought-<?php echo $id ?>" data-labelid="<?php echo $row["labelId"] ?>">
<?php
			}
?>
			<div class="ol-filetype ol-item ol-thought">
				<h3>
					<a href="#thought-<?php echo $id ?>"><?php echo $row['name'] ?></a>
					<!--<input type="checkbox" name="thought-<?php echo $id ?>" id="sel-thought-<?php echo $id ?>" value="thought-<?php echo $id ?>" /><label for="sel-thought-<?php echo $id ?>">ausw&auml;hlen</label>-->
					<button title="Optionen" class="ui-button ui-widget ui-state-default ui-corner-all ui-button-icon-only ol-options"><span class="ui-button-icon-primary ui-icon ui-icon-triangle-1-s"></span><span class="ui-button-text">Optionen</span></button>
				</h3>
				<?php if ($desc !== "") {echo '<p class="o-desc">'.$desc.'</p>';} ?>
				<p>0 Objekte (<?php echo date('d.m.Y, H:i', $row['date']) ?>)</p>
			</div>
<?php
			// If thought has objects
			if (@mysql_num_rows($resultObjects)) {
?>
			<ul class="thought-objects"<?php if ($openObjectList == $id) {echo ' style="display: block;"';} ?>>
<?php
				while ($rowObjects = mysql_fetch_array($resultObjects)) {
					$idObjects = $rowObjects['id'];
					$descObjects = $rowObjects['description'];
?>
				<li id="objects-<?php echo $idObjects ?>">
					<div class="ol-item ol-file">
						<h4>
							<a href="#objects-<?php echo $idObjects ?>"><?php echo urldecode($rowObjects["name"]) ?></a>
							<a href="#objects-<?php echo $idObjects ?>-<?php echo $id ?>" title="Optionen" class="object-options"><span class="ui-icon ui-icon-triangle-1-s" title="Optionen">Optionen</span></a>
						</h4>
						<?php if ($descObjects !== "") {echo '<p class="o-file-desc">'.$descObjects.'</p>';} ?>
						<p><?php echo calcByteUnit($rowObjects["size"]) ?> (<?php echo date('d.m.Y, H:i', $rowObjects['date']) ?>)</p>
					</div>
				</li>
<?php
				}
?>
			</ul>
<?php
			}
?>
		</li>
<?php
		}
	} else {
		echo '<li class="note-nocontent">-kein Label ausgew&auml;hlt oder keine Gedanken vorhanden; mit dem Button &quot;<strong>Neu</strong>&quot; k&ouml;nnen Sie einen neuen Gedanken anlegen-</li>';
	}
?>
	</div>
	<script type="text/javascript">
		// Mark open thoughts as active
		(function() {
			var _openThoughts = parent.MIND.OpenThoughts.getOpenThoughts();
			for (var i = 0, _len = _openThoughts.length; i < _len; i++) {
				$("#thought-" + _openThoughts[i]).addClass("active");
			}
		})();

		MINDbroker.addContentToParent("#source-object-list", "#object-list #ol-cnt ul");
		parent.MIND.ObjectList.addEvents();
		parent.$("#ol-loading").hide();
	</script>
<?php
}
?>



</body>
</html>