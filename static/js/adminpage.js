window.MINDadmin = new function() {
	var G_selfMindAdmin = this;
	var $body = $("body");

	// Debug console
	var G_debug = function(msg) {
		if (typeof window.console !== "undefined") {
			window.console.log(msg);
		} else {
			alert(msg);
		}
	};

	// Set up paths
	var G_pathRoot = "/";
	var G_pathModel = "app/model/";
	var G_pathView = "app/view/";
	var G_pathController = "app/controller/";
	var G_pathUser = "user/";

	// Set up stage
	var _setUpStage = function() {
		var $labelList = $("#label-list"), $labelListCnt = $("#ll-cnt"), $workspace = $("#workspace");
		var _windowHeight = $(window).height();
		var _height = _windowHeight - $labelList.offset().top - parseInt($labelList.css("padding-top")) - parseInt($labelList.css("padding-bottom")) - parseInt($labelList.css("margin-top")) - parseInt($labelList.css("margin-bottom"));

		$labelList.css({
			"height": _height
		});
		$labelListCnt.css({
			"height": _windowHeight - $labelListCnt.offset().top
		});
		$workspace.css({
			"height": _height,
			"width": ($(window).width() - $labelList.outerWidth(true) - 22) // 22px is for scrollbar and borders(?), which somehow can't get measured
		});
	};
	_setUpStage();
	$(window).resize(function() {
		_setUpStage();
	});

	// System tray
	var G_systemTray = function(content, messageType) {
		var $systemTray = $("#system-tray");
		var _messageClass = (messageType || messageType !== "") ? (' class="message-' + messageType + '"') : '';

		$systemTray.find("ul").append('<li' + _messageClass + '>' + content + '</li>');
		$systemTray.fadeIn("slow");

		var _timeout = window.setTimeout(function() {
			$systemTray.fadeOut().find("ul").empty();
			window.clearTimeout(_timeout);
		}, 4000);
	};


	// Search
	$("#hdr-search #hdr-search-input").autocomplete({
		source: G_pathController + "searchAdmin.php",
		select: function(event, ui) {
			_getUserData(ui.item.id);
		},
		open: function() {
			$(this).addClass("hdr-s-loading");
		},
		close: function() {
			$(this).removeClass("hdr-s-loading");
		}
	});
	$("#hdr-search form").submit(function() {
		// This isn't doing anything
		return false;
	});


	// Buttons
	$("#t-main #main-save").button({
		icons: {
			primary: 'ui-icon-disk'
		}
	}).click(function() {
		if ($("#user-id").val() == "") {
			G_systemTray("Keine userId vorhanden!", "error");
			return false;
		}

		_setUserData();

		$(this).blur();
		return false;
	});


	// Get user data
	$("#label-list #ll-cnt a").click(function() {
		_getUserData($(this).attr("href").split("-")[1]);

		$(this).blur();
		return false;
	});

	var _getUserData = function(userId) {
		$("#content-default").hide();
		$("#content-user").show();

		var $userFirstname = $("#user-firstname");
		var $userLastname = $("#user-lastname");
		var $userEmail = $("#user-email");

		$.ajax({
			type: "GET",
			url: G_pathController + "User.php?action=getUserData&userId=" + userId,
			dataType: "json",
			success: function(response) {
				if (response.result === "success") {
					var _values = response.values;
					$userFirstname.val(_values.firstName);
					$userLastname.val(_values.lastName);
					$userEmail.val(_values.email);
					$("#user-id").val(_values.id);
					$("#user-password-md5").val(_values.password);

					if (_values.activated == "1") {
						$("#user-activated").attr("checked", "checked");
					} else {
						$("#user-activated").attr("checked", "");
					}

					$("#statistics-user-id").text(_values.id);
					$("#statistics-user-label").text(_values.labels);
					$("#statistics-user-thoughts").text(_values.thoughts);
					$("#statistics-user-objects").text(_values.objects);
					$("#statistics-user-filesize").text(_values.userDirSize);
				} else {
					G_systemTray(response.message, null);
				}
			},
			error: function(response) {
				G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
			}
		});
	};

	// Set user data
	var _setUserData = function() {
		var $userFirstname = $("#user-firstname");
		var $userLastname = $("#user-lastname");
		var $userEmail = $("#user-email");

		if ($userFirstname.val() == "") {
			G_systemTray("Bitte Pflichfeld 'Vorname' f&uuml;llen!", "error");
			$userFirstname.focus();
			return false;
		} else if ($userLastname.val() == "") {
			G_systemTray("Bitte Pflichfeld 'Nachname' f&uuml;llen!", "error");
			$userLastname.focus();
			return false;
		} else if ($userEmail.val() == "") {
			G_systemTray("Bitte Pflichfeld 'E-Mail-Adresse' f&uuml;llen!", "error");
			$userEmail.focus();
			return false;
		}

		var $form = $("#content-user form");
		var _userId = $form.find("#user-id");

		$.ajax({
			type: "POST",
			url: G_pathController + "User.php?action=setUserData&userId=" + _userId.val(),
			data: $form.serialize(),
			dataType: "json",
			success: function(response) {
				if (response.result === "success") {
					G_systemTray("Daten wurden erfolgreich gespeichert", "success");
					G_systemTray("Um die ge&auml;nderten Daten in der Benutzerliste zu sehen, laden Sie bitte die Seite neu.", null);
				} else {
					G_systemTray(response.message, null);
				}
			},
			error: function(response) {
				G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
			}
		});
	};
}();