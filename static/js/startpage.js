(function() {
	// Form tabs
	$("#form li a").each(function() {
		var a = $(this);
		a.click(function() {
			$("#form div").hide();
			var id = a.attr("id").split("-")[1];
			$("#form div#form-" + id).fadeIn().find("form input:first").focus();

			a.blur();
			return false;
		});
	});

	// Intro-video
	$("#link-mind-intro-video").click(function() {
		$("#md-mind-intro-video").dialog({
			width: 666,
			height: 551,
			resizable: false
		});

		$(this).blur();
		return false;
	});

	// Password forgotten
	$("#pw-forgot").click(function() {
		$("#pw-forgot-form").dialog({
			width: 313,
			height: 230,
			resizable: false,
			modal: true,
			open: function() {
				$("#mind-intro-video").hide();
				$("#pw-email").val("").focus();
			},
			close: function() {
				$("#mind-intro-video").show();
			}
		});

		$(this).blur();
		return false;
	});

	// Imprint
	$("#imprint-link").click(function() {
		$("#imprint").dialog({
			width: 313,
			height: 200,
			resizable: false,
			modal: false,
			open: function() {
				$("#mind-intro-video").hide();
			},
			close: function() {
				$("#mind-intro-video").show();
			}
		});

		$(this).blur();
		return false;
	});


	// ------------------------------------------------------------
	// Buttons
	$("#form button").button();


	// Validation
	$.validator.setDefaults({
		submitHandler: function(el) {
			var _pathController = "app/controller/";
			var _redirectURL = "mindrecorder.php";

			if ($(el).parent("#form-reg").length > 0) {
				// Registration
				$.ajax({
					type: "POST",
					url: _pathController + "Registration.php",
					data: $("#form-reg form").serialize(),
					success: function(msg) {
						if (msg.indexOf("mind-registration-emailAlreadyExists") > -1) {
							_reloadCaptcha();
							$("#reg-password").val("");
							$("#reg-email").after('<label for="reg-email" class="error mind-registration-error">Diese E-Mail-Adresse existiert bereits!</label>').select().focus();
						} else if (msg.indexOf("mind-registration-success") > -1) {
							$("label.mind-registration-error").remove();
							$("#splash").html('Sie haben sich erfolgreich registriert und werden nun <a href="' + _redirectURL + '">zum Dienst</a> weitergeleitet &hellip;').show();
							window.setTimeout(function() {
								window.location.href = _redirectURL;
							}, 2000);
						} else if (msg.indexOf("mind-registration-captchaerror") > -1) {
							_reloadCaptcha();
							$("#reg-password").val("");
							$("#reg-captcha").val("").after('<label for="reg-captcha" class="error mind-registration-error">Sicherheitscode ist nicht korrekt.</label>');
						} else {
							_reloadCaptcha();
							$("#reg-password").val("");
							$("#reg-captcha").val("").after('<label for="reg-captcha" class="error mind-registration-error">Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!</label>');
						}
					},
					error: function() {
						$("label.registration-emailAlreadyExists").remove();
					}
				});
			} else if ($(el).parent("#form-login").length > 0) {
				// Login
				$.ajax({
					type: "POST",
					url: _pathController + "Login.php",
					data: $("#form-login > form").serialize(),
					success: function(msg) {
						if (msg.indexOf("mind-login-userUnknown") > -1) {
							$("#login-password").val("").after('<label for="login-password" class="error mind-login-error">Benutzerdaten sind unbekannt oder stimmen nicht &uuml;berein!</label>');
							$("#login-email").select().focus();
						} else if (msg.indexOf("mind-login-success") > -1) {
							$("label.mind-login-error").remove();
							$("#splash").html('Sie haben sich erfolgreich angemeldet und werden nun <a href="' + _redirectURL + '">zum Dienst</a>  weitergeleitet &hellip;').show();
							window.location.href = _redirectURL;
						} else if (msg.indexOf("mind-login-admin") > -1) {
							$("label.mind-login-error").remove();
							$("#splash").html('Sie haben sich erfolgreich angemeldet und werden nun <a href="administrator.php">zum Dienst</a>  weitergeleitet &hellip;').show();
							window.location.href = "administrator.php";
						} else if (msg.indexOf("mind-login-deactivated") > -1) {
							$("label.mind-login-error").remove();
							$("#login-password").val("").after('<label for="login-password" class="error">Account ist gel&ouml;scht!</label>');
						} else {
							$("#login-password").val("").after('<label for="login-password" class="error mind-login-error">Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!</label>');
							$("#login-email").select().focus();
						}
					},
					error: function() {
						$("label.mind-login-error").remove();
						$("label.login-userUnknown").remove();
					}
				});
			} else if ($(el).parent("#pw-forgot-form").length > 0) {
				// Password forgotten
				var _email = $("#pw-email").val();
				$.ajax({
					type: "POST",
					url: _pathController + "PasswordForgotten.php",
					data: $("#pw-forgot-form form").serialize(),
					global: false, // Don't trigger loading gif
					success: function(msg) {
						$("#pw-forgot-form").dialog("close"); // Close dialog with form

						if (msg.indexOf("mind-pw-userUnknown") > -1) {
							$("#pw-forgot-result p").text("Der Benutzer ist leider unbekannt.");
							$("#pw-forgot-result").dialog({
								width: 313,
								height: 230,
								resizable: false,
								modal: true,
								buttons: {
									'Fenster schliessen': function() {
										$(this).dialog('close');
									}
								},
								open: function() {
									$("#mind-intro-video").hide();
								},
								close: function() {
									$("#mind-intro-video").show();
								}
							});
						} else if (msg.indexOf("mind-pw-success") > -1) {
							var _newPassword = msg.substring((msg.indexOf("mind-pw-success=") + 16), msg.indexOf("||"));
							$("#pw-forgot-result p").html("Ihr neues Passwort lautet:<br />" + _newPassword);
							$("#pw-forgot-result").dialog({
								width: 313,
								height: 230,
								resizable: false,
								modal: true,
								buttons: {
									'Fenster schliessen': function() {
										$(this).dialog('close');
									}
								},
								open: function() {
									$("#mind-intro-video").hide();
								},
								close: function() {
									$("#login-email").val(_email);
									$("#login-password").val(_newPassword);
									$("#mind-intro-video").show();
								}
							});
						}
					}
				});
			}
		}
	});
	$("#form-login > form").validate();
	$("#form-reg form").validate();
	$("#pw-forgot-form form").validate();


	// Loading layer + gif
	$("#loading").ajaxStart(function(){
		$(this).show();
	});

	$("#loading").ajaxStop(function(){
		$(this).hide();
	});


	// Reload captcha
	var _reloadCaptcha = function() {
		var _captchaDate = new Date();
		var _captchaRand = Math.random().toString().split(".")[1].substring(0, 9);
		var _captchaHeight = "60";
		var _captchaWidth = "281";
		var _captchaImg = _captchaDate.getFullYear() + "" + (_captchaDate.getMonth() + 1) + "" + _captchaDate.getDate() + "" + _captchaRand + "-" + _captchaHeight + "-" + _captchaWidth + ".jpgx";

		$("#reg-captcha-img").val(_captchaImg);
		$("#reg-captcha-img-img").attr("src", "http://www.opencaptcha.com/img/" + _captchaImg).height(_captchaHeight).width(_captchaWidth);
	};
	
	$("#reload-captcha").click(function() {
		_reloadCaptcha();

		$(this).blur();
		return false;
	});
})();
