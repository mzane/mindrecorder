<?php
include_once("../model/server.inc.php");


class Objects {
	// Get link info inside canvas (see http://www.smashingmagazine.com/2010/04/15/php-what-you-need-to-know-to-play-with-the-web/)
	public function getLinkInfo($url) {
		$ch = curl_init();
		curl_setopt($ch, CURLOPT_URL, htmlspecialchars($url));
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		$output = curl_exec($ch);
		curl_close($ch);

		if (preg_match('/<title\b[^>]*>(.*?)<\/title>/', $output, $match)) {
			echo $match[1]; // We return the decoded value since we need it in the HTML later on 
		} else {
			echo "error";
		}
	}


	// New objects
	private function newObjects($db_objects,$thoughtId,$fileName,$fileType,$fileSize,$description) {
		$userId = $_SESSION["userid"];
		$thoughtId = mysql_real_escape_string($thoughtId);
		$fileName = mysql_real_escape_string($fileName);
		$fileType = mysql_real_escape_string($fileType);
		$fileSize = mysql_real_escape_string($fileSize);
		$description = mysql_real_escape_string($description);
		$date = mktime();

		$query = "INSERT INTO $db_objects (userId,thoughtId,name,type,size,description,date) VALUES ('$userId','$thoughtId','$fileName','$fileType','$fileSize','$description','$date')";
		$result = mysql_query($query);

		$query = "SELECT * FROM $db_objects WHERE userId='$userId' AND thoughtId='$thoughtId' AND name='$fileName' AND date='$date' LIMIT 1";
		$result = mysql_query($query);
		$data = mysql_fetch_array($result);

		if (is_array($data)) {
			return '{"result": "success", "values": {"id": "'.$data["id"].'", "thoughtId": "'.$data["thoughtId"].'", "name": "'.$data["name"].'", "type": "'.$data["type"].'", "size": "'.$data["size"].'", "description": "'.$data["description"].'", "date": "'.date('d.m.Y, H:i', $data["date"]).'"}}';
		} else {
			return '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Response is getting written inside the iframe id="hidden-new-upload-target"
	public function setResponse($response) {
		echo '<script type="text/javascript">parent.MIND.Objects.uploadObjectResponse(\''.$response.'\');</script>';
	}

	// Do upload
	public function doUpload($fileArray, $serverPathUser, $maxUploadFileSize, $maxUploadFileSizeAll, $db_objects) {
		$userId = $_SESSION["userid"];
		$fileName = $fileArray["name"];
		$fileName = urlencode($fileName);
		$fileType = $fileArray["type"];
		$fileTmpName = $fileArray["tmp_name"];
		$fileError = $fileArray["error"];
		$fileSize = $fileArray["size"];
		$description = $_POST["new-upload-desc"];
		$thoughtId = $_POST["new-upload-thoughtId"];
		$date = mktime();

		// Check if any error occured
		if ($fileError > 0) {
			$this->setResponse('{"response": "error"}');
			return false;
		}

		// Check for file size
		if ($fileSize > $maxUploadFileSize) {
			$this->setResponse('{"response": "fileSizeTooBig"}');
			return false;
		}

		// Check for max size of 2GB of user dir
		if (($this->getUserDirSize($serverPathUser, $userId) + $fileSize) > $maxUploadFileSizeAll) {
			$this->setResponse('{"response": "userDirIsFull"}');
			return false;
		}


		// Check if file already exists
		$query = "SELECT * FROM $db_objects WHERE name='$fileName' AND userId='$userId' AND thoughtId='$thoughtId' LIMIT 1";
		$result = mysql_query($query);
		$data = mysql_fetch_array($result);
		if (!is_array($data)) {
			// Create db-entry
			$data = $this->newObjects($db_objects,$thoughtId,$fileName,$fileType,$fileSize,$description);
			$data = json_decode($data, true);
		} else {
			// Update db-entry
			$queryUpdate = "UPDATE $db_objects SET date='$date' WHERE name='$fileName' AND userId='$userId' AND thoughtId='$thoughtId'";
			mysql_query($queryUpdate);
		}

		// File handling
		if (is_array($data)) {
			$id = ($data["values"]["id"]) ? $data["values"]["id"] : $data["id"]; // $data["values"]["id"] is set by newObjects()
			$fileName = $userId."__".$id."__".$thoughtId."_____".$fileName;
			$targetPath = "../../".$serverPathUser.$userId;

			// Make sure that the user has his user directory (although this is also done in Registration())
			if (!is_dir($targetPath)) {
				mkdir($targetPath, 0744, true);
			}

			// Finally move uploaded file to correct place
			if (@move_uploaded_file($fileTmpName, $targetPath."/".$fileName)) {
				$this->setResponse('{"response": "success", "userId": "'.$userId.'", "id": "'.$id.'", "thoughtId": "'.$thoughtId.'", "fileName": "'.urldecode($fileName).'", "fileType": "'.$fileType.'", "fileSize": "'.$fileSize.'", "description": "'.$description.'"}');
			} else {
				$this->setResponse('{"response": "error"}');
			}
		} else {
			$this->setResponse('{"response": "error"}');
		}
	}

	// Get object data
	public function getObjectData($serverPathUser, $db_objects) {
		if (isset($_GET["objectId"])) {
			$userId = $_SESSION["userid"];
			$objectId = mysql_real_escape_string($_GET["objectId"]);

			$query = "SELECT * FROM $db_objects WHERE id='$objectId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			$fileName = $userId."__".$data["id"]."__".$data["thoughtId"]."_____".$data["name"];
			$path = "../../".$serverPathUser.$userId;
			if (is_array($data) && is_file($path."/".$fileName)) {
				// This is (almost) the same notation than the one used in doUpload()
				echo '{"result": "success", "userId": "'.$userId.'", "id": "'.$data["id"].'", "thoughtId": "'.$data["thoughtId"].'", "fileName": "'.urldecode($fileName).'", "fileType": "'.$data["type"].'", "fileSize": "'.$data["size"].'", "description": "'.$data["description"].'"}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten (POST-Variablen nicht gesetzt). Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Delete objects
	public function deleteObjects($serverPathUser, $db_objects, $paramObjectId = null) {
		if (isset($_POST["objectId"]) || isset($paramObjectId)) {
			$userId = $_SESSION["userid"];
			// POST comes from the normal ajax-call, param comes from Thought->deleteThought
			$objectId = isset($paramObjectId) ? $paramObjectId : mysql_real_escape_string($_POST["objectId"]);

			// We have to select the data first because we need it for the filename to delete later on
			$query = "SELECT * FROM $db_objects WHERE id='$objectId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			// Delete db entries
			$query = "DELETE FROM $db_objects WHERE id='$objectId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);

			// Delete file as well
			$fileName = $userId."__".$objectId."__".$data["thoughtId"]."_____".$data["name"];
			$path = "../../".$serverPathUser.$userId;
			if (is_file($path."/".$fileName)) {
				unlink($path."/".$fileName);
			}

			// If Thought->deleteThought sent the request we don't need the echo-ed json because deleteThought will handle that
			if (isset($paramObjectId)) {
				return;
			}

			if ($result) {
				echo '{"result": "success", "fileName": "'.$fileName.'"}';
			} else {
				echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
			}

			clearstatcache();
		} else {
			echo '{"result": "error", "message": "Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!"}';
		}
	}

	// Download
	public function download($serverPathUser, $db_objects) {
		if (isset($_GET["objectId"]) && isset($_GET["thoughtId"])) {
			$userId = $_SESSION["userid"];
			$objectId = htmlspecialchars(mysql_real_escape_string($_GET["objectId"]));
			$thoughtId = htmlspecialchars($_GET["thoughtId"]);

			// Get info from db
			$query = "SELECT * FROM $db_objects WHERE id='$objectId' AND userId='$userId' LIMIT 1";
			$result = mysql_query($query);
			$data = mysql_fetch_array($result);

			// Set filename and path
			$origFileName = $data["name"];
			$fileName = $userId."__".$objectId."__".$thoughtId."_____".$origFileName;
			$path = "../../".$serverPathUser.$userId;
			$pathFileName = $path."/".$fileName;
			$tmpPathFileName = $path."/".$origFileName;

			if (is_file($pathFileName)) {
				// Make a temporarily available copy of the file with the original filename first
				if (copy($pathFileName, $tmpPathFileName)) {
					$fileSize = filesize($tmpPathFileName);
					$fileType = $data["type"];

					header("Content-Type: $fileType");
					header("Content-Disposition: attachment; filename=$origFileName");
					header("Content-Length: $fileSize");

					readfile($tmpPathFileName);

					// Delete the previously copied file afterwards
					unlink($tmpPathFileName);

					clearstatcache();

					exit;
				}
			}
		}
	}

	// Get user directory's size (http://de2.php.net/manual/de/function.filesize.php)
	public function getUserDirSize($serverPathUser, $userId) {
		$path = "../../".$serverPathUser.$userId;

		if (is_dir($path)) {
			$size = 0;
			foreach(new RecursiveIteratorIterator(new RecursiveDirectoryIterator($path)) as $file){
				$size+=$file->getSize();
			}

			clearstatcache();
			
			return $size;
		} else {
			return 0;
		}
	}
}


$objects = new Objects;

// Get link info inside canvas
if (isset($_GET["action"]) && $_GET["action"] === "getLinkInfo") {
	$objects->getLinkInfo($_GET["url"]);
}

// Do upload
if (isset($_FILES["Filedata"]) || isset($_FILES["new-upload-file"])) {
	$files = (isset($_FILES["Filedata"])) ? $_FILES["Filedata"] : $_FILES["new-upload-file"];
	$objects->doUpload($files, $serverPathUser, $maxUploadFileSize, $maxUploadFileSizeAll, $db_objects);
}

// Get object data (for editing object)
if (isset($_GET["action"]) && $_GET["action"] === "getObjectData") {
	$objects->getObjectData($serverPathUser, $db_objects);
}

// Delete objects
if (isset($_GET["action"]) && $_GET["action"] === "deleteObjects") {
	$objects->deleteObjects($serverPathUser, $db_objects);
}

// Download
if (isset($_GET["action"]) && $_GET["action"] === "download") {
	$objects->download($serverPathUser, $db_objects);
}
