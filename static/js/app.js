// INIT MIND OBJECT
window.MIND = new function() {
	var G_selfMind = this;
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
	var G_pathModel = "app/model/";
	var G_pathView = "app/view/";
	var G_pathController = "app/controller/";
	var G_pathUser = "user/";

	// Init autosave
	G_selfMind.autosave = true;

	// "New"-thoughtId
	var G_newThoughtId = 999999999;
	var G_nolabelId = 999999990;

	// Timeout for uploading (2 minutes)
	var G_uploadTimeout = 120000;

	// Basic events on document
	var _strgDown = false;
	$(document).bind({
		"click.body": function() {
			if ($(".contextmenu").length > 0) {
				$(".contextmenu").remove();
			}
		},
		"contextmenu.body": function() {
			if ($(".contextmenu").length > 0) {
				$(".contextmenu").remove();
			}
			return false;
		/*},
		// KeyCode 17 (ctrl) + 83 (s) trigger saveThoughts - doesn't really work
		"keydown.body": function(event) {
			var _keyCode = event.which;
			if (_keyCode === 17) {
				_strgDown = true;
				return false;
			}
		},
		"keyup.body": function(event) {
			var _keyCode = event.which;
			if (_keyCode === 83 && _strgDown) {
				G_selfMind.Thought.saveThought();
				_strgDown = false;
				return false;
			}*/
		}
	});

	// Set up stage (note: method is getting called at the end of the script again)
	var _setUpStage = function() {
		var $labelList = $("#label-list"), $labelListCnt = $("#ll-cnt"), $objectList = $("#object-list"), $objectListCnt = $("#ol-cnt"), $workspace = $("#workspace"), $canvasWrapper = $("#canvas-wrapper"), $chat = $("#chat");
		var _windowHeight = $(window).height();
		var _height = _windowHeight - $labelList.offset().top - parseInt($labelList.css("padding-top")) - parseInt($labelList.css("padding-bottom")) - parseInt($labelList.css("margin-top")) - parseInt($labelList.css("margin-bottom"));

		$labelList.css({
			"height": _height
		});
		$labelListCnt.css({
			"height": _windowHeight - $labelListCnt.offset().top
		});
		$objectList.css({
			"height": _height
		});
		$objectListCnt.css({
			"height": _windowHeight - $objectListCnt.offset().top
		});
		$workspace.css({
			"height": _height,
			"width": ($(window).width() - $labelList.outerWidth(true) - $objectList.outerWidth(true) - 22) // 22px is for scrollbar and borders(?), which somehow can't get measured
		});
		$canvasWrapper.css({
			"height": _windowHeight - $canvasWrapper.offset().top - parseInt($canvasWrapper.css("padding-top")) - parseInt($canvasWrapper.css("padding-bottom")) - parseInt($canvasWrapper.css("margin-top")) - parseInt($canvasWrapper.css("margin-bottom")) - parseInt($workspace.css("padding-top")) - parseInt($workspace.css("padding-bottom")) - parseInt($workspace.css("margin-top")) - parseInt($workspace.css("margin-bottom")) - (($chat.css("display") === "block") ? $chat.outerHeight(true) : 0)
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
		var _timeoutTimer = 4000;

		// Remove upload-messages on the next incoming message
		$systemTray.find("li[class='message-upload']").remove();

		$systemTray.find("ul").append('<li' + _messageClass + '>' + content + '</li>');
		$systemTray.fadeIn("slow");

		// Since uploads can take a while we set the timeout to a higher value
		if (messageType === "upload") {
			_timeoutTimer = G_uploadTimeout;
		}

		var _timeout = window.setTimeout(function() {
			$systemTray.fadeOut().find("ul").empty();
			window.clearTimeout(_timeout);
		}, _timeoutTimer);
	};

	// Automated jobs running every 2 minutes
	var _automatedJobs = window.setInterval(function() {
		var _canvas = G_selfMind.Canvas;

		// Clean up canvas
		_canvas.cleanUpCanvas();

		// Close all opened layers
		_canvas.getCanvasEl().trigger("click.main");

		// Trigger autosave
		if (G_selfMind.autosave && G_selfMind.Canvas.CanvasDataHolder.getValue("save") == "") {
			G_selfMind.Thought.saveThought();
		}

		// Set session data
		G_selfMind.User.setSessionData();
	}, 120000);

	// Update broker - pass load="labels" if you want to update both labels and thoughts; pass -1 as ids if you dont want to focus a specific item
	var G_updateBroker = function(load, labelId, objectId, openObjectList) {
		var _returnIds = "";
		if (labelId && !objectId) {
			_returnIds = "&labelId=" + labelId;
		} else if (!labelId && objectId) {
			_returnIds = "&objectId=" + objectId;
		} else if (labelId && objectId) {
			_returnIds = "&labelId=" + labelId + "&objectId=" + objectId;
		}

		var _openObjectList = "";
		if (openObjectList) {
			_openObjectList = "&openObjectList=" + openObjectList;
		}

		$("#broker").attr("src", G_pathView + "broker.php?load=" + load + _returnIds + "" + _openObjectList + "&ts=" + (parseInt(Math.random() * Date.parse(Date()))));
	};

	// Update title
	var G_updateTitle = function(txt) {
		if (txt !== "" && txt !== "Neu") {
			document.title = txt + " - MIND recorder";
		} else {
			document.title = "MIND recorder";
		}
	};

	// Update breadcrumb (just pass a null-value if you dont want to pass one the parameters, or pass an empty string if you want to empty the html)
	var G_updateBreadcrumb = function(contentLabel, contentThought) {
		if (contentLabel || contentLabel === "") {
			$("#hdr-b-label").html(contentLabel);
		}
		if (contentThought || contentThought === "") {
			$("#hdr-b-thought").html(contentThought);
		}
	};

	// Convert byte to KB or MB
	var G_calcByteUnit = function(bytes) {
		var _byteLength = bytes.toString().length, _temp = [], _temp2 = "";

		if (_byteLength > 3 && _byteLength < 7) { // to KB
			bytes = Math.round(bytes/1024*100000)/100000;
			_temp = bytes.toString().split(".");
			_temp2 = _temp[0] + "," + _temp[1].substring(0, 2);
			return _temp2 + " kB";
		} else if (_byteLength > 6 && _byteLength < 10) { // to MB
			bytes = Math.round(bytes/1048576*100000)/100000;
			_temp = bytes.toString().split(".");
			_temp2 = _temp[0] + "," + _temp[1].substring(0, 2);
			return _temp2 + " MB";
		} else {
			return bytes + " Byte";
		}
	};



	// -------------------------------------------------------------------------
	// HEADER
	G_selfMind.Header = new function() {
		var _selfHeader = this;

		// Search
		$("#hdr-search #hdr-search-input").autocomplete({
			source: G_pathController + "searchApp.php",
			select: function(event, ui) {
				var _item = ui.item;
				G_updateBroker("labels", _item.labelId, _item.id, null);
				G_selfMind.ObjectList.selectThought(_item.id);
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


		// Feedback
		$("#hdr-feedback").click(function() {
			var $dialog;
			var $form;
			var $feedbackMsg;

			$("#md-feedback").dialog({
				width: 313,
				height: 380,
				resizable: false,
				modal: true,
				buttons: {
					'Abbrechen': function() {
						$(this).dialog('close');
					},
					'Feedback schicken': function() {
						$dialog = $(this);
						$form = $dialog.find("form");
						$feedbackMsg = $form.find("#feedback-msg");

						if ($feedbackMsg.val() === "") {
							G_systemTray("Bitte alle Pflichtfelder f&uuml;llen!", "error");
							if ($feedbackMsg.val() === "") $feedbackMsg.focus();
							return false;
						}

						$.ajax({
							type: "POST",
							url: G_pathController + "Feedback.php?action=newFeedback",
							data: $form.serialize(),
							dataType: "json",
							success: function(response) {
								if (response.result === "success") {
									G_systemTray("Feedback erfolgreich versandt", "success");

									$dialog.dialog('close');
								} else {
									G_systemTray(response.message, null);
								}
							},
							error: function(response) {
								G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
							}
						});
					}
				},
				close: function() {
					$(this).find("form")[0].reset();
				}
			});

			$(this).blur();
			return false;
		});

		// Game
		$("#hdr-game").click(function() {
			$("#md-game").dialog({
				width: 570,
				height: 450,
				resizable: false,
				modal: true
			});

			$(this).blur();
			return false;
		});

		// About
		$("#hdr-about").click(function() {
			$("#md-about").dialog({
				width: 313,
				height: 320,
				resizable: false,
				modal: true
			});

			$(this).blur();
			return false;
		});

		// User settings
		$("#hdr-user-settings").click(function() {
			G_selfMind.User.userSettings();

			$(this).blur();
			return false;
		});

		// Logout - note that this is getting triggered in userSettings too
		$("#hdr-logout").click(function() {
			G_selfMind.User.setSessionData();
		});
	}();



	// -------------------------------------------------------------------------
	// USER
	G_selfMind.User = new function() {
		var _selfUser = this;

		// Set session data (save open thoughts + interface-settings)
		_selfUser.setSessionData = function() {
			$.ajax({
				type: "POST",
				url: G_pathController + "User.php?action=setSessionData",
				data: "OpenLabel=" + G_selfMind.OpenLabel.getOpenLabel() + "&OpenThoughts=" + G_selfMind.OpenThoughts.getOpenThoughts() + "&OpenThought=" + G_selfMind.OpenThoughts.getOpenThought() + "&LabelListWidth=" + $("#label-list").width() + "&ObjectListWidth=" + $("#object-list").width()
			});
		};

		// If user is reloading the window or just closing the browser (not logging out) we need to save the last session
		$(window).unload(function() {
			_selfUser.setSessionData();
		});

		// Get session data from last session
		(function() {
			$.ajax({
				type: "GET",
				url: G_pathController + "User.php?action=getSessionData",
				dataType: "json",
				success: function(response) {
					_selfUser.sessionData = response;
				}
			});
		})();

		// User settings
		_selfUser.userSettings = function() {
			var $userFirstname = $("#user-firstname");
			var $userLastname = $("#user-lastname");
			var $userEmail = $("#user-email");
			var $userPassword = $("#user-password");
			var $userActivated = $("#user-activated");

			$("#md-user-settings").dialog({
				width: 313,
				height: 470,
				resizable: false,
				modal: true,
				disabled: true,
				buttons: {
					'Abbrechen': function() {
						$(this).dialog('close');
					},
					'Speichern': function() {
						var $dialog = $(this);
						$dialog.dialog("disable");

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
						} else if ($userPassword.val() != "" && $userPassword.val().length < 5) {
							G_systemTray("Feld 'Passwort' muss mindestens 5 Zeichen enthalten!", "error");
							$userPassword.focus();
							return false;
						}

						// Set user data
						var _doSetUserData = function() {
							var $form = $dialog.find("form");
							$.ajax({
								type: "POST",
								url: G_pathController + "User.php?action=setUserData",
								data: $form.serialize(),
								dataType: "json",
								success: function(response) {
									if (response.result === "success") {
										G_systemTray("Ihre Daten wurden erfolgreich bearbeitet", "success");

										// Update the name in the toolbar
										$("#hdr-user-settings").find("span").html(response.values.firstName);

										$dialog.dialog("close");
									} else if (response.result === "deactivate") {
										// Logout
										window.location.href = $("#hdr-logout").attr("href");
									} else {
										$dialog.dialog("enable");
										G_systemTray(response.message, null);
									}
								},
								error: function(response) {
									$dialog.dialog("enable");
									G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
								}
							});
						};

						// If user wants to deactivate his account
						if ($userActivated.is(":checked")) {
							$("#md-user-deactivate").dialog({
								width: 350,
								height: 200,
								resizable: false,
								modal: true,
								buttons: {
									'Nein': function() {
										$userActivated.attr("checked", "");
										$(this).dialog("close");
										$dialog.dialog("enable");
									},
									'Ja, Account loeschen': function() {
										_doSetUserData();
										$(this).dialog("close");
									}
								}
							});
							return false;
						}
						_doSetUserData();
					}
				},
				open: function() {
					var $dialog = $(this);

					// Get user data
					$.ajax({
						type: "GET",
						url: G_pathController + "User.php?action=getUserData",
						dataType: "json",
						success: function(response) {
							if (response.result === "success") {
								var _values = response.values;
								$userFirstname.val(_values.firstName);
								$userLastname.val(_values.lastName);
								$userEmail.val(_values.email);
								$("#user-password-md5").val(_values.password);

								// Show user's statistics
								$("#statistics-user-label").text(_values.labels);
								$("#statistics-user-thoughts").text(_values.thoughts);
								$("#statistics-user-objects").text(_values.objects);
								$("#statistics-user-filesize").text(_values.userDirSize + " von 2 GB");

								$dialog.dialog("enable");
							} else {
								G_systemTray(response.message, null);
							}
						},
						error: function(response) {
							G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
						}
					});


					$dialog.find("form").submit(function() {
						//$dialog.next().find("button:contains('Speichern')").trigger("click");
						return false;
					});
				},
				close: function() {
					$(this).find("form")[0].reset();
				}
			});
		};
	}();



	// -------------------------------------------------------------------------
	// LABEL LIST
	G_selfMind.LabelList = new function() {
		var _selfLabelList = this;
		var $labelList = $("#label-list");

		// New label
		$("#label-new").button().click(function() {
			G_selfMind.Label.newLabel();

			$(this).blur();
			return false;
		});

		// Select item
		var _selectLabel = function(labelId) {
			$labelList.find("#ll-cnt li").removeClass("active");
			$labelList.find("#label-" + labelId).addClass("active");

			G_selfMind.OpenLabel.setOpenLabel(labelId);
			G_updateBroker("labels", labelId, null, null);
		};
		// Public wrapper for selectLabel - currently only needed by sessionData methods at the end of the script
		_selfLabelList.selectLabelWrapper = function(labelId) {
			if (labelId != G_nolabelId) {
				_selectLabel(labelId);
			}
		};

		// Public method used by newThought and editThought
		_selfLabelList.selectLabel = function(labelId) {
			$labelList.find("#ll-cnt li").removeClass("active");
			$labelList.find("#label-" + labelId).addClass("active");

			G_selfMind.OpenLabel.setOpenLabel(labelId);
		};

		// Create contextmenu
		var _createContextmenu = function(event, labelId) {
			if ($(".contextmenu").length > 0) {
				$(".contextmenu").remove();
			}

			$body.append('<div class="contextmenu" id="label-contextmenu"><ul>' +
					'<li><a href="javascript://;" id="label-contextmenu-labeledit">Umbenennen/Eigenschaften</a></li>' +
					'<li><a href="javascript://;" id="label-contextmenu-labeldelete">L&ouml;schen</a></li>' +
					'<li><a href="javascript://;" id="label-contextmenu-labelnew">Neu</a></li>' +
					'</ul></div>');

			var $contextmenu = $("#label-contextmenu");

			$contextmenu.css({
				"left": event.clientX,
				"top": event.clientY
			});

			$("#label-contextmenu-labeledit").bind("click", function() {
				G_selfMind.Label.editLabel(labelId);
				$contextmenu.remove();
			});

			$("#label-contextmenu-labeldelete").bind("click", function() {
				G_selfMind.Label.deleteLabel(labelId);
				$contextmenu.remove();
			});

			$("#label-contextmenu-labelnew").bind("click", function() {
				G_selfMind.Label.newLabel();
				$contextmenu.remove();
			});
		};

		// Events on list items
		_selfLabelList.addEvents = function() {
			// All lis
			$labelList.find("#ll-cnt li").each(function() {
				var _labelId = $(this).attr("id").split("-")[1];

				$(this).bind({
					"click.label": function() {
						_selectLabel(_labelId);

						$(this).blur();
						return false;
					}
				});
			});

			// Only main lis
			$labelList.find("#ll-cnt-main li").each(function() {
				var _labelId = $(this).attr("id").split("-")[1];

				$(this).bind({
					"contextmenu.label": function(event) {
						_createContextmenu(event, _labelId);

						$(this).blur();
						return false;
					}
				});

				// Click on arrow-down-icon
				$(this).find(".ui-icon").click(function(event) {
					_createContextmenu(event, _labelId);

					$(this).blur();
					return false;
				});
			});
		};

		// Open/close label list
		var _labelListWidth = $labelList.width(); // 140px
		$("#ll-handler a").click(function() {
			if ($labelList.width() == 0) { // show
				$labelList.animate({
					"width": _labelListWidth
				}, "fast", function() {
					$("#ll-cnt, #ll-head").fadeIn("fast");
					_setUpStage();
				});
			} else { // hide
				$("#ll-cnt, #ll-head").fadeOut("fast", function() {
					$labelList.animate({
						"width": 0
					}, "fast", function() {
						_setUpStage();
					});
				});
			}

			$(this).blur();
			return false;
		});
	}();



	// -------------------------------------------------------------------------
	// LABEL
	G_selfMind.Label = new function() {
		var _selfLabel = this;

		// New label
		_selfLabel.newLabel = function() {
			var $dialog = null;
			var $form = null;
			var $newLabelName = $("#new-label-name");
			var $newLabelFilterType = null;

			$("#md-new-label").dialog({
				width: 313,
				height: 290,
				resizable: false,
				modal: true,
				buttons: {
					'Abbrechen': function() {
						$(this).dialog('close');
					},
					'Speichern': function() {
						$dialog = $(this);
						$form = $dialog.find("form");
						$newLabelFilterType = $form.find("#new-label-filter-type");

						if ($newLabelName.val() === "" || $newLabelFilterType.val() === "") {
							G_systemTray("Bitte alle Pflichtfelder f&uuml;llen!", "error");
							if ($newLabelName.val() === "") $newLabelName.focus();
							if ($newLabelFilterType.val() === "") $newLabelFilterType.focus();
							return false;
						}

						$.ajax({
							type: "POST",
							url: G_pathController + "Label.php?action=newLabel",
							data: $form.serialize(),
							dataType: "json",
							success: function(response) {
								if (response.result === "success") {
									var _values = response.values;
									var _id = _values.id;
									G_selfMind.OpenLabel.setOpenLabel(_id);
									G_updateBroker("labels", _id, null, null);
									G_selfMind.LabelList.selectLabel(_id);
									G_updateBreadcrumb(_values.name, "");
									G_systemTray("Label erfolgreich angelegt", "success");

									$dialog.dialog('close');
								} else {
									G_systemTray(response.message, null);
								}
							},
							error: function(response) {
								G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
							}
						});
					}
				},
				open: function() {
					$dialog = $(this);
					$dialog.find("form").submit(function() {
						//$dialog.next().find("button:contains('Speichern')").trigger("click");
						return false;
					});
					$newLabelName.focus();
				},
				close: function() {
					$(this).find("form")[0].reset();
				}
			});
		};

		// Delete label
		_selfLabel.deleteLabel = function(labelId) {
			$("#md-label-delete").dialog({
				width: 313,
				height: 290,
				resizable: false,
				modal: true,
				buttons: {
					'Nein': function() {
						$(this).dialog('close');
					},
					'Ja': function() {
						var $dialog = $(this);
						$.ajax({
							type: "POST",
							url: G_pathController + "Label.php?action=deleteLabel",
							data: {"labelId": labelId},
							dataType: "json",
							success: function(response) {
								if (response.result === "success") {
									G_updateBroker("labels", -1, null, null);
									G_selfMind.OpenLabel.setOpenLabel(-1);
									G_systemTray("Label erfolgreich gel&ouml;scht", "success");

									$dialog.dialog('close');
								} else {
									G_systemTray(response.message, null);
								}
							},
							error: function(response) {
								G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
							}
						});
					}
				}
			});
		};

		// Edit label
		_selfLabel.editLabel = function(labelId) {
			$.ajax({
				type: "GET",
				url: G_pathController + "Label.php?action=getLabelData&labelId=" + labelId,
				dataType: "json",
				success: function(response) {
					if (response.result === "success") {
						var _responseValues = response.values;

						var $dialog = null;
						var $form = null;
						var $editLabelName = $("#edit-label-name");
						var $editLabelFilterType = $("#edit-label-filter-type");

						$editLabelName.val(_responseValues.name);
						$editLabelFilterType.val(_responseValues.searchType);

						$("#md-edit-label").dialog({
							width: 313,
							height: 290,
							resizable: false,
							modal: true,
							buttons: {
								'Abbrechen': function() {
									$(this).dialog('close');
								},
								'Speichern': function() {
									$dialog = $(this);
									$form = $dialog.find("form");

									if ($editLabelName.val() === "" || $editLabelFilterType.val() === "") {
										G_systemTray("Bitte alle Pflichtfelder f&uuml;llen!", "error");
										if ($editLabelName.val() === "") $editLabelName.focus();
										if ($editLabelFilterType.val() === "") $editLabelFilterType.focus();
										return false;
									}

									$.ajax({
										type: "POST",
										url: G_pathController + "Label.php?action=editLabel&labelId=" + labelId,
										data: $form.serialize(),
										dataType: "json",
										success: function(response) {
											if (response.result === "success") {
												var _values = response.values;
												var _labelId = _values.id;
												G_updateBroker("labels", G_selfMind.OpenLabel.getOpenLabel(), null, null);

												// Only update breadcrumb if label is open
												if (G_selfMind.OpenLabel.getOpenLabel() == _labelId) {
													G_updateBreadcrumb(_values.name, null);
												}

												G_systemTray("Label erfolgreich bearbeitet", "success");

												$dialog.dialog('close');
											} else {
												G_systemTray(response.message, null);
											}
										},
										error: function(response) {
											G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
										}
									});
								}
							},
							open: function() {
								$dialog = $(this);
								$dialog.find("form").submit(function() {
									//$dialog.next().find("button:contains('Speichern')").trigger("click");
									return false;
								});
								$editLabelName.focus();
							},
							close: function() {
								$(this).find("form")[0].reset();
							}
						});
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



	// -------------------------------------------------------------------------
	// OPEN LABELS
	G_selfMind.OpenLabel = new function() {
		var _selfOpenLabel = this;

		// Var with open/currently active label
		var _openLabel = G_nolabelId;

		// Set open label
		_selfOpenLabel.setOpenLabel = function(openLabel) {
			_openLabel = openLabel;
		};

		// Get open label
		_selfOpenLabel.getOpenLabel = function() {
			return _openLabel;
		};
	}();



	// -------------------------------------------------------------------------
	// OBJECT LIST
	G_selfMind.ObjectList = new function() {
		var _selfObjectList = this;

		var $objectList = $("#object-list");

		// De-/select all - currently not in use
		$("#ol-aux").click(function() {
			var $chboxes = $("#ol-cnt input:checkbox");
			if ($chboxes.attr("checked") == "") {
				$chboxes.attr("checked", "checked");
			} else {
				$chboxes.attr("checked", "");
			}

			$(this).blur();
			return false;
		});

		// Button new thought
		$("#new-thought").button().click(function() {
			G_selfMind.Thought.newThought();

			$(this).blur();
			return false;
		});

		// Select item
		_selfObjectList.selectThought = function(thoughtId) {
			$objectList.find("#thought-" + thoughtId).addClass("active");

			// Is thought already open or not, if so just select it, if not open it
			var _openThoughts = G_selfMind.OpenThoughts;
			if (_openThoughts.isThoughtOpen(thoughtId)) {
				_openThoughts.selectThought(thoughtId);
			} else {
				_openThoughts.openThought(thoughtId);
			}
		};

		// Create thought contextmenu
		var _createThoughtContextMenu = function(event, thoughtId) {
			if ($(".contextmenu").length > 0) {
				$(".contextmenu").remove();
			}

			$body.append('<div class="contextmenu" id="thought-contextmenu"><ul>' +
					'<li><a href="javascript://;" id="thought-contextmenu-thoughtedit">Umbenennen/Eigenschaften</a></li>' +
					'<li><a href="javascript://;" id="thought-contextmenu-thoughtdelete">L&ouml;schen</a></li>' +
					'<li><a href="javascript://;" id="thought-contextmenu-newthought">Neu</a></li>' +
//					'<li><a href="javascript://;" id="thought-contextmenu-thoughtworkwithcontact">Mit Kontakt an Gedanke arbeiten</a></li>' +
//					'<li><a href="javascript://;" id="thought-contextmenu-markallthoughts">alle Gedanken markieren</a></li>' +
					'</ul></div>');

			var $contextmenu = $("#thought-contextmenu");

			$contextmenu.css({
				"left": event.clientX,
				"top": event.clientY
			});

			$("#thought-contextmenu-thoughtedit").bind("click", function() {
				G_selfMind.Thought.editObject(thoughtId);
				$contextmenu.remove();
			});

			$("#thought-contextmenu-thoughtdelete").bind("click", function() {
				G_selfMind.Thought.deleteThought(thoughtId);
				$contextmenu.remove();
			});

			$("#thought-contextmenu-thoughtworkwithcontact").bind("click", function() {
				// todo: implement thoughtworkwithcontact
				$contextmenu.remove();
			});

			$("#thought-contextmenu-newthought").bind("click", function() {
				$("#hdr-new-thought").trigger("click");
				$contextmenu.remove();
			});

			$("#thought-contextmenu-markallthoughts").bind("click", function() {
				$("#ol-aux").trigger("click");
				$contextmenu.remove();
			});
		};

		// Create object contextmenu
		var _createObjectContextMenu = function(event, thoughtId, objectId) {
			if ($(".contextmenu").length > 0) {
				$(".contextmenu").remove();
			}

			$body.append('<div class="contextmenu" id="object-contextmenu"><ul>' +
					'<li><a href="javascript://;" id="object-contextmenu-objectdownload">Herunterladen</a></li>' +
					'<li><a href="javascript://;" id="object-contextmenu-objectdelete">L&ouml;schen</a></li>' +
					'</ul></div>');

			var $contextmenu = $("#object-contextmenu");

			$contextmenu.css({
				"left": event.clientX,
				"top": event.clientY
			});

			$("#object-contextmenu-objectdownload").bind("click", function() {
				G_selfMind.Objects.download(objectId, thoughtId);
				$contextmenu.remove();
			});

			$("#object-contextmenu-objectdelete").bind("click", function() {
				G_selfMind.Objects.deleteObjects(objectId, thoughtId);
				$contextmenu.remove();
			});
		};

		// Events on list items
		_selfObjectList.addEvents = function() {
			$objectList.find("li[id^='thought-']").each(function() {
				var $this = $(this);
				var _thoughtId = $this.attr("id").split("-")[1];

				// Divs having the actual actions/events (not the li)
				$this.find(".ol-thought").unbind(".thought").bind({
					"click.thought": function() {
						_selfObjectList.selectThought(_thoughtId);

						$(this).blur();
						return false;
					},
					"contextmenu.thought": function(event) {
						_createThoughtContextMenu(event, _thoughtId);

						$(this).blur();
						return false;
					}
				});

				// If thought has objects
				if ($this.hasClass("has-objects")) {
					// Bind click on an object
					$this.find("li").each(function() {
						var _objectId = $(this).attr("id").split("-")[1];
						$(this).find(".ol-file").unbind(".object").bind({
							"click.object": function() {
								_selfObjectList.selectThought(_thoughtId);
								if (G_selfMind.OpenThoughts.isThoughtOpen(_thoughtId)) { // This is probably not really working due to race conditions
									G_selfMind.Objects.getObjectData(_objectId);
								}

								$(this).blur();
								return false;
							},
							"contextmenu.object": function(event) {
								_createObjectContextMenu(event, _thoughtId, _objectId);

								$(this).blur();
								return false;
							}
						});
					});

					// Open/close child object list
					$this.find(".ol-has-objects-handler a").click(function(event) {
						event.stopPropagation();
						var $ulObjects = $(this).parent("div").next().next(".thought-objects");

						if ($ulObjects.css("display") == "none") {
							$ulObjects.slideDown("fast");
							$(this).find("span").removeClass("ui-icon-circlesmall-plus").addClass("ui-icon-circlesmall-minus");
						} else {
							$ulObjects.slideUp("fast");
							$(this).find("span").removeClass("ui-icon-circlesmall-minus").addClass("ui-icon-circlesmall-plus");
						}

						$(this).blur();
						return false;
					});

					// Delete object
					$this.find(".object-options").click(function(event) {
						var _href = $(this).attr("href").split("-");
						_createObjectContextMenu(event, _href[1], _href[2]); // href[1] = objectId, href[2] = thoughtId

						$(this).blur();
						return false;
					});
				}

				// Option-pulldown
				$this.find(".ol-options").bind("click", function(event) {
					_createThoughtContextMenu(event, _thoughtId);

					$(this).blur();
					return false;
				});
			});
		};

		// Open/close object list
		var _objectListWidth = $objectList.width(); // 260px
		$("#ol-handler a").click(function() {
			if ($objectList.width() == 0) {
				$objectList.animate({
					"width": _objectListWidth
				}, "fast", function() {
					$("#ol-cnt, #ol-head").fadeIn("fast");
					_setUpStage();
				});
			} else {
				$("#ol-cnt, #ol-head").fadeOut("fast", function() {
					$objectList.animate({
						"width": 0
					}, "fast", function() {
						_setUpStage();
					});
				});
			}
			$(this).blur();
			return false;
		});
	}();



	// -------------------------------------------------------------------------
	// OBJECTS
	G_selfMind.Thought = new function() {
		var _selfThought = this;

		// Save thought
		_selfThought.saveThought = function(thoughtId) {
			// Clean up canvas first so no bullshit will get saved
			G_selfMind.Canvas.cleanUpCanvas();

			// See if user is currently writing, and if so abort the save
			if (G_selfMind.Canvas.isWriting()) {
				G_systemTray("Kein Speichern m&ouml;glich, wenn Text-Werkzeug benutzt wird.", null);
				return false;
			}

			// Set "saved"-flag
			G_selfMind.Canvas.CanvasDataHolder.setValue("save", "saved");

			// If there is the "new"-thought open, we won't autoSave it
			if (G_selfMind.OpenThoughts.getOpenThought() === G_newThoughtId) return;

			// Usually we save the currently active thought, but sometimes we need to pass the thoughtId to get it right
			thoughtId = thoughtId ? thoughtId : G_selfMind.OpenThoughts.getOpenThought();

			var $ccpc = $("#canvas-content-pusher-content");
			$ccpc.val($("#canvas-" + thoughtId).html());

			$.ajax({
				type: "POST",
				url: G_pathController + "Thought.php?action=setThoughtContent&thoughtId=" + thoughtId,
				data: $("#canvas-content-pusher").serialize(),
				dataType: "json",
				success: function(response) {
					if (response.result === "success") {
						G_systemTray("Gedanke erfolgreich gespeichert", "success");
					} else {
						G_systemTray(response.message, null);
					}
				},
				error: function(response) {
					G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
				}
			});

			$ccpc.val("");

			// Set session data ultimately
			G_selfMind.User.setSessionData();
		};

		// New thought (newThoughtId is optional, actually only for "new"-thought)
		_selfThought.newThought = function(newThoughtId) {
			var $newThoughtName = $("#new-thought-name");
			var $newThoughtContent = $("#new-thought-content");

			// Get label list
			$.ajax({
				type: "GET",
				url: G_pathController + "Label.php?action=getLabelList",
				dataType: "json",
				success: function(response) {
					if (response.result === "success") {
						var _values = response.values, _valuesI = "", _valuesIId = "";
						var _html = "";

						if (_values.length < 1) {
							_html = '<option value="' + G_nolabelId + '">-kein Label-</option>';
						} else {
							for (var i = 0, _len = _values.length; i < _len; i++) {
								_valuesI = _values[i];
								_valuesIId = _valuesI.id;
								_html += '<option value="' + _valuesIId + '"' + ((_valuesIId == G_selfMind.OpenLabel.getOpenLabel()) ? ' selected="selected"' : '') + '>' + _valuesI.name + '</option>';
							}
						}

						$("#new-thought-label").html(_html);
					} else {
						G_systemTray(response.message, null);
					}
				},
				error: function(response) {
					G_systemTray("Label konnten nicht geladen werden. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
				}
			});

			$("#md-new-thought").dialog({
				width: 313,
				height: 290,
				resizable: false,
				modal: true,
				buttons: {
					'Abbrechen': function() {
						$(this).dialog('close');
					},
					'Speichern': function() {
						var $dialog = $(this);
						var $form = $dialog.find("form");

						if ($newThoughtName.val() === "") {
							G_systemTray("Bitte Feld Gedankenname f&uuml;llen!", "error");
							$newThoughtName.focus();
							return false;
						}

						// Add content only when saving "new"-thought
						if (newThoughtId) {
							var $newCanvas = $("#canvas-" + newThoughtId);
							$newThoughtContent.val($newCanvas.html());
							$newCanvas.empty();
						}

						$.ajax({
							type: "POST",
							url: G_pathController + "Thought.php?action=newThought",
							data: $form.serialize(),
							dataType: "json",
							success: function(response) {
								if (response.result === "success") {
									var _values = response.values;
									var _thoughtId = _values.id;
									var _labelId = _values.labelId;
									G_selfMind.OpenLabel.setOpenLabel(_labelId);
									G_updateBroker("labels", _labelId, _thoughtId, null);
									G_selfMind.LabelList.selectLabel(_labelId);
									G_selfMind.OpenThoughts.openThought(_thoughtId);

									G_systemTray("Gedanke erfolgreich angelegt", "success");

									$dialog.dialog('close');
								} else {
									G_systemTray(response.message, null);
								}
							},
							error: function(response) {
								G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
							}
						});
					}
				},
				open: function() {
					var $dialog = $(this);
					$dialog.find("form").submit(function() {
						//$dialog.next().find("button:contains('Speichern')").trigger("click");
						return false;
					});
					$newThoughtName.focus();
				},
				close: function() {
					$newThoughtContent.val("");
					$(this).find("form")[0].reset();
				}
			});
		};

		// Delete thought
		_selfThought.deleteThought = function(objectId) {
			$("#md-thought-delete").dialog({
				width: 313,
				height: 200,
				resizable: false,
				modal: true,
				buttons: {
					'Nein': function() {
						$(this).dialog('close');
					},
					'Ja': function() {
						var $dialog = $(this);
						$.ajax({
							type: "POST",
							url: G_pathController + "Thought.php?action=deleteThought",
							data: {"objectId": objectId},
							dataType: "json",
							success: function(response) {
								if (response.result === "success") {
									G_updateBroker("thoughts", G_selfMind.OpenLabel.getOpenLabel(), -1, null);
									G_selfMind.OpenThoughts.removeThought(objectId, false);
									G_systemTray("Gedanke erfolgreich gel&ouml;scht", null);

									$dialog.dialog('close');
								} else {
									G_systemTray(response.message, null);
								}
							},
							error: function(response) {
								G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
							}
						});
						$(this).dialog('close');
					}
				}
			});
		};

		// Edit thought
		_selfThought.editObject = function(objectId) {
			$.ajax({
				type: "GET",
				url: G_pathController + "Thought.php?action=getThoughtData&objectId=" + objectId,
				dataType: "json",
				success: function(response) {
					if (response.result === "success") {
						var _responseValues = response.values;
						var $editThoughtName = $("#edit-thought-name");

						$editThoughtName.val(_responseValues.name);
						$("#edit-thought-label").val(_responseValues.labelId);
						$("#edit-thought-desc").val(_responseValues.description);

						// Get label list
						$.ajax({
							type: "GET",
							url: G_pathController + "Label.php?action=getLabelList",
							dataType: "json",
							success: function(response) {
								if (response.result === "success") {
									var _values = response.values;
									var _id = -1, _html = "", _selected = "";

									// Create html and set selected option
									if (_values.length < 1) {
										_html = '<option value="' + G_nolabelId + '">-kein Label-</option>';
									} else {
										for (var i = 0, _len = _values.length; i < _len; i++) {
											_id = _values[i].id;
											if (_id == _responseValues.labelId) {
												_selected = ' selected="selected"';
											} else {
												_selected = "";
											}
											_html += '<option value="' + _id + '"' + _selected + '>' + _values[i].name + '</option>';
										}
									}
									$("#edit-thought-label").html(_html);
								} else {
									G_systemTray(response.message, null);
								}
							},
							error: function(response) {
								G_systemTray("Label konnten nicht geladen werden. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
							}
						});

						$("#md-edit-thought").dialog({
							width: 313,
							height: 290,
							resizable: false,
							modal: true,
							buttons: {
								'Abbrechen': function() {
									$(this).dialog('close');
								},
								'Speichern': function() {
									var $dialog = $(this);
									var $form = $dialog.find("form");

									if ($editThoughtName.val() === "") {
										G_systemTray("Gedankenname darf nicht leer sein!", "error");
										$editThoughtName.focus();
										return false;
									}

									$.ajax({
										type: "POST",
										url: G_pathController + "Thought.php?action=editObject&objectId=" + objectId,
										data: $form.serialize(),
										dataType: "json",
										success: function(response) {
											if (response.result === "success") {
												var _values = response.values;
												var _thoughtId = _values.id;

												if (G_selfMind.OpenThoughts.isThoughtOpen(_thoughtId)) {
													var _labelId = _values.labelId;
													G_selfMind.OpenLabel.setOpenLabel(_labelId);
													G_updateBroker("labels", G_selfMind.OpenLabel.getOpenLabel(), _thoughtId, null);
													G_selfMind.OpenThoughts.updateTab(_thoughtId, $editThoughtName.val());
													G_selfMind.LabelList.selectLabel(_labelId);
													G_selfMind.ObjectList.selectThought(_thoughtId);
													G_updateBreadcrumb(G_selfMind.OpenThoughts.getLabelTextFromLabelId(_labelId), null);
												} else {
													G_updateBroker("labels", G_selfMind.OpenLabel.getOpenLabel(), G_selfMind.OpenThoughts.getOpenThought(), null);
												}

												G_systemTray("Gedanke erfolgreich gespeichert", "success");

												$dialog.dialog('close');
											} else {
												G_systemTray(response.message, null);
											}
										},
										error: function() {
											G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang!", "error");
										}
									});
								}
							},
							open: function() {
								var $dialog = $(this);
								$dialog.find("form").submit(function() {
									//$dialog.next().find("button:contains('Speichern')").trigger("click");
									return false;
								});
								$editThoughtName.focus();
							},
							close: function() {
								$(this).find("form")[0].reset();
							}
						});
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



	// -------------------------------------------------------------------------
	// UPLOAD
	G_selfMind.Objects = new function() {
		var _selfObjects = this;
		var $dialog = null, $form = null, _timeout = null;

		// Upload object
		_selfObjects.uploadObject = function() {
			// When in "new"-thought we don't allow uploading files
			if (G_selfMind.OpenThoughts.getOpenThought() === G_newThoughtId) {
				G_systemTray("Im &quot;Neu&quot;-Gedanken k&ouml;nnen keine Dateien hochgeladen werden.", null);
				return false;
			}

			var $newUploadFile = $("#new-upload-file");
			var $newUploadFilelist = $("#new-upload-filelist");
			var $newUploadDesc = $("#new-upload-desc");
			var $newUploadThoughtId = $("#new-upload-thoughtId");

			$("#md-upload").dialog({
				width: 313,
				height: 320,
				resizable: false,
				modal: true,
				closeOnEscape: false,
				buttons: {
					'Abbrechen': function() {
						$dialog = $(this);
						$form = $dialog.find("form");
						$dialog.dialog('close');
					},
					'Hochladen': function() {
						$dialog = $(this);
						$form = $dialog.find("form");

						if ($newUploadFile.val() === "") {
							G_systemTray("Bitte Datei ausw&auml;hlen!", "error");
							$newUploadFile.focus();
							return false;
						}

						// Write thoughtId to hidden-input (it can only be the currently opened one)
						$newUploadThoughtId.val(G_selfMind.OpenThoughts.getOpenThought());

						// Submit form to iframe
						$form.submit();

						// Show information
						_handleDialog(true);
						G_systemTray("Datei wird gepr&uuml;ft &hellip;", "upload");

						// Close dialog if opened longer than upload timeout
						_timeout = window.setTimeout(function() {
							_handleDialog(false);
							$dialog.dialog('close');
							G_systemTray("Ein Fehler ist aufgetreten. Der Vorgang wurde abgebrochen.", null);
						}, G_uploadTimeout);
					}
				},
				close: function() {
					/*$form = $(this).find("form");
					$newUploadFilelist.hide().find("li").remove();
					$form.find(".off").remove();*/

					_handleDialog(false);
					$(this).find("form")[0].reset();
					window.clearTimeout(_timeout);
				},
				open: function() {
					// todo: HTML5 Multiple file upload (http://robertnyman.com/html5/fileapi/fileapi.html)
					/*$form = $(this).find("form");
					_selfObjects.traverseFiles = function(files) {
						var _file, _fileInfo, _input;

						for (var i=0, il=files.length; i<il; i++) {
							_file = files[i];
							_fileInfo = "<li><strong>" + _file.name + "</strong> (" + G_calcByteUnit(_file.size) + ")</li>";
							$newUploadFilelist.show().append(_fileInfo);

							_input = '<input type="file" name="new-upload-file" value="' + _file.name + '" class="off">';
							$form.append(_input);
						}
					};

					$newUploadFile.change(function() {
						$newUploadFilelist.find("li").remove();
						$form.find(".off").remove();
						_selfObjects.traverseFiles(this.files);
					});*/
				}
			});
		};

		// Handle response of iframe (function is actually triggered within the iframe (echo-ed by Upload.php))
		_selfObjects.uploadObjectResponse = function(uploadResponse) {
			uploadResponse = jQuery.parseJSON(uploadResponse);
			if (uploadResponse.response = "success") {
				G_selfMind.Canvas.Drawing.addObjectToCanvas(uploadResponse);
				var _thoughtId = uploadResponse.thoughtId;
				G_updateBroker("thoughts", G_selfMind.OpenLabel.getOpenLabel(), _thoughtId, _thoughtId);
				G_systemTray("Datei erfolgreich hochgeladen!", "success");
				$dialog.dialog('close');

				// Handle filetypes
				/*$.ajax({
					type: "POST",
					url: G_pathController + "Filetypes.php?action=handleFiletypes",
					data: "filetype=" + uploadResponse.fileType
				});*/
			} else if (uploadResponse.response = "fileSizeTooBig") {
				G_systemTray("Dateigr&ouml;&szlig;e ist zu hoch! Bitte Dateien mit weniger als 2 MB hochladen.", "error");
				_handleDialog(false);
			} else if (uploadResponse.response = "userDirIsFull") {
				G_systemTray("Ihr maximaler Speicherplatz von 2 GB ist verbraucht. Bitte l&ouml;schen Sie Dateien oder laden Sie eine kleinere Datei hoch.", "error");
				_handleDialog(false);
			} else {
				G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang.", "error");
				_handleDialog(false);
			}
		};

		// Handle dialog
		var _handleDialog = function(disable) {
			if (disable) {
				$dialog.dialog("disable").next(".ui-dialog-buttonpane").find("button").attr("disabled", "disabled");
			} else {
				$dialog.dialog("enable").next(".ui-dialog-buttonpane").find("button").attr("disabled", "");
			}
		};

		// Get object data
		_selfObjects.getObjectData = function(objectId) {
			$.ajax({
				type: "GET",
				url: G_pathController + "Objects.php?action=getObjectData",
				data: {"objectId": objectId},
				dataType: "json",
				success: function(response) {
					if (response.result === "success") {
						G_selfMind.Canvas.Drawing.addObjectToCanvas(response);
					} else {
						G_systemTray(response.message, null);
					}
				},
				error: function(response) {
					G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
				}
			});
		};
		
		// Delete object
		_selfObjects.deleteObjects = function(objectId, thoughtId) {
			$("#md-object-delete").dialog({
				width: 313,
				height: 200,
				resizable: false,
				modal: true,
				buttons: {
					'Nein': function() {
						$(this).dialog('close');
					},
					'Ja': function() {
						var $dialog = $(this);
						$.ajax({
							type: "POST",
							url: G_pathController + "Objects.php?action=deleteObjects",
							data: {"objectId": objectId},
							dataType: "json",
							success: function(response) {
								if (response.result === "success") {
									G_updateBroker("thoughts", G_selfMind.OpenLabel.getOpenLabel(), -1, thoughtId);
									G_selfMind.Canvas.Drawing.removeObjectFromCanvas(response.fileName);
									G_systemTray("Objekt erfolgreich gel&ouml;scht", null);

									$dialog.dialog('close');
								} else {
									G_systemTray(response.message, null);
								}
							},
							error: function(response) {
								G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
							}
						});
						$(this).dialog('close');
					}
				}
			});
		};

		// Download
		_selfObjects.download = function(objectId, thoughtId) {
			window.location.href = G_pathController + "Objects.php?action=download&objectId=" + objectId + "&thoughtId=" + thoughtId;
		};
	};



	// -------------------------------------------------------------------------
	// OPEN THOUGHTS
	G_selfMind.OpenThoughts = new function() {
		var _selfOpenThoughts = this;

		// Array of open thoughts + variable with currently active thought
		var _openThoughts = [G_newThoughtId];
		var _openThought = G_newThoughtId;


		// Open thought
		_selfOpenThoughts.openThought = function(thoughtId) {
			_addOpenThought(thoughtId);
			_addTab(thoughtId); // _addCanvas() is called here
			_selfOpenThoughts.selectThought(thoughtId);
		};

		// Select thought
		_selfOpenThoughts.selectThought = function(thoughtId) {
			_setOpenThought(thoughtId);
			_selectTab(thoughtId);
			_selectCanvas(thoughtId);

			var _text = $tabHolder.find("li#tab-" + thoughtId + " a").text();
			G_updateTitle(_text);
			G_updateBreadcrumb(_selfOpenThoughts.getLabelTextFromThoughtId(thoughtId), _text);

			// This is more like a hack: we set the tool back to "default" whenever a thought was selected
			$("#canvas-tools #t-tools label").removeClass("ui-state-active");
			$("#tool-default").trigger("click").next("label").addClass("ui-state-active");
		};

		// Remove thought
		_selfOpenThoughts.removeThought = function(thoughtId, triggerSave) {
			_removeOpenThought(thoughtId);
			_removeCanvas(thoughtId, triggerSave);
			_removeTab(thoughtId);
		};


		// Open mulitple thoughts (e.g. coming from session when starting up) - called at the end of the script
		_selfOpenThoughts.openMultipleThoughts = function(thoughtIds, thoughtId) {
			for (var i = 0, len = thoughtIds.length; i < len; i++) {
				if (thoughtIds[i] != G_newThoughtId) {
					_selfOpenThoughts.openThought(thoughtIds[i]);
				}
			}
			
			// Select the thought that was opened the last time - we need the timeout because the tabs and canvases need to be completely loaded and then set the active item (more like a hack)
			window.setTimeout(function() {
				_selfOpenThoughts.selectThought(thoughtId);
			}, 1000);
		};


		// -------------------------------------------------------------------------
		// Helper methods

		// Add open thought
		var _addOpenThought = function(thoughtId) {
			if (!_selfOpenThoughts.isThoughtOpen(thoughtId)) {
				_openThoughts.push(thoughtId);
			}
			return _openThoughts;
		};

		// Remove open thought
		var _removeOpenThought = function(thoughtId) {
			for (var i = 0, len = _openThoughts.length; i < len; i++) {
				if (thoughtId == _openThoughts[i]) {
					_openThoughts.splice(i, 1);
				}
			}
			return _openThoughts;
		};

		// Get open thoughts
		_selfOpenThoughts.getOpenThoughts = function() {
			return _openThoughts;
		};

		// Is thought open/in array?
		_selfOpenThoughts.isThoughtOpen = function(thoughtId) {
			return _openThoughts.indexOf(thoughtId) > -1;
		};

		// Set open (active) thought
		var _setOpenThought = function(thoughtId) {
			_openThought = thoughtId;
			return _openThought;
		};

		// Get open thought
		_selfOpenThoughts.getOpenThought = function() {
			return _openThought;
		};

		// Get label text (this is more like a hack - we actually would need the value/text in an array and get it from there instead of parsing the dom)
		_selfOpenThoughts.getLabelTextFromThoughtId = function(thoughtId) {
			var _return = "";
			if ($("#thought-" + thoughtId).length > 0) {
				_return = $("#ll-cnt #label-" + $("#thought-" + thoughtId).attr("data-labelid")).find("a").text();
			} else {
				_return = $("#ll-cnt #label-" + $("#tab-" + thoughtId).attr("data-labelid")).find("a").text();
			}

			return _return;
		};
		_selfOpenThoughts.getLabelTextFromLabelId = function(labelId) {
			return $("#ll-cnt #label-" + labelId).find("a").text();
		};


		// -------------------------------------------------------------------------
		// TABS
		var $tabHolder = $("#canvas-tabs ul");

		// Add tab
		var _addTab = function(thoughtId) {
			// "New"-thought
			if (thoughtId === _openThought) {
				_addTabMarkup(thoughtId, G_nolabelId, "Neu", true);
				_addCanvas(thoughtId, "");
				return false;
			}

			// All other thoughts
			$.ajax({
				type: "GET",
				url: G_pathController + "Thought.php?action=getThoughtContent&thoughtId=" + thoughtId,
				dataType: "json",
				success: function(response) {
					if (response.result === "success") {
						var _values = response.values;
						var _thoughtName = _values.name;

						_addTabMarkup(thoughtId, _values.labelId, _thoughtName, false);
						_addCanvas(thoughtId, _values.content);

						G_updateTitle(_thoughtName);
						G_updateBreadcrumb(_selfOpenThoughts.getLabelTextFromLabelId(_values.labelId), _thoughtName);
					} else {
						G_systemTray(response.message, null);
					}
				},
				error: function(response) {
					G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
				}
			});
		};

		var _addTabMarkup = function(thoughtId, labelId, thoughtName, doNewThought) {
			if (!doNewThought) { // All other thoughts
				$tabHolder.prepend('<li id="tab-' + thoughtId + '" data-labelid="' + labelId + '" class="ui-state-default ui-corner-top ui-tabs-selected ui-state-active"><a href="#canvas-' + thoughtId + '">' + thoughtName + '</a> <span title="Tab schließen" class="ui-icon ui-icon-close">Tab schließen</span></li>');
				$("li#tab-" + thoughtId).bind({
					"click.tab": function() {
						_selfOpenThoughts.selectThought(thoughtId);

						$(this).find("a").blur();
						return false;
					}
				});
				$("li#tab-" + thoughtId + " .ui-icon-close").bind({
					"click.tab": function(event) {
						event.stopPropagation();
						_selfOpenThoughts.removeThought(thoughtId, true);

						$(this).blur();
						return false;
					}
				});
			} else { // "New"-thought
				$tabHolder.prepend('<li id="tab-' + thoughtId + '" data-labelid="' + labelId + '" class="ui-state-default ui-corner-top ui-tabs-selected ui-state-active"><a href="#canvas-' + thoughtId + '">' + thoughtName + '</a></li>');
				$("li#tab-" + thoughtId).bind({
					"click.tab": function() {
						_selfOpenThoughts.selectThought(thoughtId);

						$(this).find("a").blur();
						return false;
					}
				});
			}
		};

		// Select tab
		var _selectTab = function(thoughtId) {
			$tabHolder.find("li").removeClass("ui-tabs-selected ui-state-active");
			$tabHolder.find("li#tab-" + thoughtId).addClass("ui-tabs-selected ui-state-active");
		};

		// Remove tab
		var _removeTab = function(thoughtId) {
			$tabHolder.find("li#tab-" + thoughtId).remove();
		};

		// Update tab's text
		_selfOpenThoughts.updateTab = function(thoughtId, tabText) {
			if (_selfOpenThoughts.isThoughtOpen(thoughtId)) {
				$tabHolder.find("li#tab-" + thoughtId + " a").html(tabText);
			}
		};


		// -------------------------------------------------------------------------
		// CANVAS
		var $canvasWrapper = $("#canvas-wrapper");

		// Add canvas
		var _addCanvas = function(thoughtId, thoughtContent) {
			$canvasWrapper.prepend('<div class="canvas" id="canvas-' + thoughtId + '">' + thoughtContent + '</div>');

			// Canvas-object is not available at start up-time due to race conditions
			if (typeof G_selfMind.Canvas !== "undefined") {
				// Set canvas-color
				var _bgColor = G_selfMind.Canvas.CanvasDataHolder.getValue("canvascolor");
				if (_bgColor) {
					$("#canvas-" + thoughtId).css("background-color", _bgColor);
				}

				// Set saved-flag
				G_selfMind.Canvas.CanvasDataHolder.setValue("save", "saved");
			}

			// Handle thoughtContent's objects
			if (thoughtContent !== "") {
				var $obj = null;
				$("#canvas-" + thoughtId + " > *").each(function() {
					$obj = $(this);

					// Bind events to objects, but not for pen-objects nor the canvas-data-holder
					if (!$obj.hasClass("pen-object") || !$obj.hasClass("canvas-data-holder")) {
						G_selfMind.Canvas.Drawing.bindEventsToCanvasObjects($obj);
					}

					// Replace single-quotes with double-quotes in text-objects
					if ($obj.hasClass("text-object")) {
						var _html = $obj.html();
						$obj.html(_html.replace(/'/g, "&quot;"));
					}
				});

				// Resize canvas
				G_selfMind.Canvas.resizeCanvas();
			}
		};

		// Select canvas
		var _selectCanvas = function(thoughtId) {
			$canvasWrapper.find("div.canvas").hide();
			$canvasWrapper.find("div#canvas-" + thoughtId).show();
		};

		// Remove canvas
		var _removeCanvas = function(thoughtId, triggerSave) {
			if (triggerSave && G_selfMind.Canvas.CanvasDataHolder.getValue("save") == "") { // Ask user if he wants to save thought before closing canvas
				$("#md-save-thought").dialog({
					width: 313,
					height: 200,
					resizable: false,
					modal: true,
					buttons: {
						'Nein': function() {
							_removeAndSelect(thoughtId);

							$(this).dialog('close');
						},
						'Ja': function() {
							G_selfMind.Thought.saveThought(thoughtId); // We have to pass thoughtId since there might be a slight chance that the saveThought-method itself doesnt have this information anymore

							_removeAndSelect(thoughtId);

							$(this).dialog('close');
						}
					}
				});
			} else {
				_removeAndSelect(thoughtId);
			}
		};

		var _removeAndSelect = function(thoughtId) {
			$canvasWrapper.find("div#canvas-" + thoughtId).remove();

			// Select another open canvas (the last one in the array)
			var _ot = _selfOpenThoughts.getOpenThoughts();
			var _thoughtId = _ot[_ot.length - 1];
			_selfOpenThoughts.selectThought(_thoughtId);

			// Update broker/select correct item in thoughts list
			G_updateBroker("thoughts", G_selfMind.OpenLabel.getOpenLabel(), _thoughtId, null);
		};


		// Initiate the "new"-thought
		_selfOpenThoughts.openThought(_openThought);
	}();



	// -------------------------------------------------------------------------
	// CANVAS
	G_selfMind.Canvas = new function() {
		var _selfCanvas = this;

		var $canvasEl = function() {
			return $("#canvas-" + G_selfMind.OpenThoughts.getOpenThought());
		};
		// Public wrapper for $canvasEl() (e.g. for automatedJobs)
		_selfCanvas.getCanvasEl = function() {
			return $canvasEl();
		};
		var $canvasWrapperEl = $("#canvas-wrapper");
		
		_selfCanvas.activeObject = "";

		// Set cursor of canvas object
		_selfCanvas.setCanvasCursor = function(cursor) {
			$canvasEl().removeClass("cursor-default cursor-move cursor-text cursor-link cursor-pen cursor-eraser cursor-crosshair").addClass("cursor-" + cursor);
		};

		// Bind events on canvas
		$(".canvas").live("mousedown mouseup", function() {
			if ($("#thickness-line-container").css("display") == "block") {
				$("#thickness-line-container").hide()
			}
			if ($("#mlColorPicker").css("display") == "block") {
				$("#mlColorPicker").hide()
			}

			// Remove the saved-flag so autosave and save-on-remove can be triggered (this is quite critical!)
			G_selfMind.Canvas.CanvasDataHolder.setValue("save", "");
		}).live("contextmenu", function() {
			if ($(".contextmenu").length > 0) {
				$(".contextmenu").remove();
			}
			return false;
		})/*.live("drop", function(event) {
			G_selfMind.Objects.traverseFiles(event.dataTransfer.files);
			return false;
		})*/;

		// todo: HTML5 Multiple file upload (ondrop)
		/*$canvasEl().dragenter(function () {
			return false;
		});
		$canvasEl().dragover(function () {
			return false;
		});
		$canvasEl().bind("drop", function(event) {
			G_selfMind.Objects.traverseFiles(event.dataTransfer.files);
			return false;
		});*/

		// Resize canvas if objects in canvas tend to overlap the canvas
		_selfCanvas.resizeCanvas = function() {
			var $obj = null, _resize = false, $cEl = $canvasEl();
			$cEl.children().each(function() {
				$obj = $(this);

				// Handle height
				var _bottom = parseInt($obj.css("top")) + $obj.height();
				var _canvasHeight =$cEl.height();
				if (_bottom > _canvasHeight) {
					$cEl.height(_bottom + 50);
					_resize = true;
				}

				// Handle width
				var _right = parseInt($obj.css("left")) + $obj.width();
				var _canvasWidth = $cEl.width();
				if (_right > _canvasWidth) {
					$cEl.width(_right + 50);
					_resize = true;
				}
			});

			if (_resize) {
				G_systemTray("Arbeitsfl&auml;chengr&ouml;&szlig;e wurde dem Inhalt angepasst", null);
				_resize = false
			}
		};

		// Workspace miniature
		(function() {
			var $workspaceMiniature = $("#workspace-miniature"), $workspaceMiniatureClip = $("#workspace-miniature-clip"), _miniatureFactor = 30, _scrolled = false;

			$canvasWrapperEl.bind("scroll", function() {
				var $cEl = $canvasEl();
				if (!$cEl.position()) return;
				
				_scrolled = true;

				// If system tray is active the miniature needs to get positioned differently
				if ($("#system-tray").is(":visible")) {
					$workspaceMiniature.addClass("diff-pos");
				} else {
					$workspaceMiniature.removeClass("diff-pos");
				}

				$workspaceMiniature.show().css({
					height: ($cEl.height() / _miniatureFactor),
					width: ($cEl.width() / _miniatureFactor)
				});

				$workspaceMiniatureClip.css({
					height: ($canvasWrapperEl.height() / _miniatureFactor) - 5,
					width: ($canvasWrapperEl.width() / _miniatureFactor) - 5,
					left: (Math.abs($cEl.position().left) / _miniatureFactor),
					top: (Math.abs($cEl.position().top) / _miniatureFactor)
				});
			});

			var _interval = window.setInterval(function() {
				if (!_scrolled) {
					$workspaceMiniature.fadeOut("fast");
				}
				_scrolled = false;
			}, 1000);
		})();

		// Make text unselectable when drawing on canvas (http://www.webtoolkit.info/javascript-unselectable-text.html)
		(function() {
			var Unselectable = {
				enable : function(e) {
					e = e ? e : window.event;
					if (e.button != 1) {
						var targer;
						if (e.target) {
							targer = e.target;
						} else if (e.srcElement) {
							targer = e.srcElement;
						}
						var targetTag = targer.tagName.toLowerCase();
						if ((targetTag != "input") && (targetTag != "textarea")) {
							return false;
						}
					}
				},
				disable : function () {
					return true;
				}
			};
			if (typeof(document.onselectstart) != "undefined") {
				document.onselectstart = Unselectable.enable;
			} else {
				document.onmousedown = Unselectable.enable;
				document.onmouseup = Unselectable.disable;
			}
		})();

		// Remove empty and rte containing text objects from canvas
		_selfCanvas.cleanUpCanvas = function() {
			$canvasEl().children(".text-object:empty").remove();
//			$canvasEl().children(".text-object").has("#mind-canvas-addtext").remove();
		};

		// If user is currently writing
		_selfCanvas.isWriting = function() {
			return $canvasEl().find("#mind-canvas-addtext").length > 0;
		};



		// -------------------------------------------------------------------------
		// UI-BUTTONS
		try {
			// Main functions
			$("#canvas-tools #t-main #main-save").button({
				icons: {
					primary: 'ui-icon-disk'
				}
			}).click(function() {
				if (G_selfMind.OpenThoughts.getOpenThought() === G_newThoughtId) {
					G_selfMind.Thought.newThought(G_newThoughtId);
				} else {
					G_selfMind.Thought.saveThought();
				}
			}).next().button().click(function() {
				G_selfMind.autosave = (G_selfMind.autosave) ? false : true;
			}).parent().buttonset();

			// Upload
			$("#canvas-tools #t-upload").buttonset().click(function() {
				G_selfMind.Objects.uploadObject();

				$(this).blur();
				return false;
			});

			// Tools
			$("#canvas-tools #t-tools").buttonset().find("#tool-default").button({
				text: false,
			    icons: {
				    primary: "tool-icon-default"
			    }
			});
			$("#tool-text").button({
				text: false,
			    icons: {
				    primary: "tool-icon-text"
			    }
			});
			$("#tool-link").button({
				text: false,
			    icons: {
				    primary: "tool-icon-link"
			    }
			});
			$("#tool-pen").button({
				text: false,
			    icons: {
				    primary: "tool-icon-pen"
			    }
			});
			$("#tool-rectangle").button({
				text: false,
			    icons: {
				    primary: "tool-icon-rectangle"
			    }
			});
			$("#tool-circle").button({
				text: false,
			    icons: {
				    primary: "tool-icon-circle"
			    }
			});
			$("#tool-eraser").button({
				text: false,
			    icons: {
				    primary: "tool-icon-eraser"
			    }
			});

			// Properties
			$("#canvas-tools #t-props").buttonset();

			// Canvas tools
			$("#canvas-tools #t-canvas #canvas-color").mlColorPicker({'onChange': function(val) {
				val = (val !== "transparent" && val.indexOf("#") == -1) ? "#" + val : val;
				$canvasEl().css("background-color", val);

				// Set canvas-color to CDH so it can get saved
				_selfCanvas.CanvasDataHolder.setValue("canvascolor", val);

				// Remove saved-flag
				G_selfMind.Canvas.CanvasDataHolder.setValue("save", "");
			}});
			$("#canvas-tools #t-canvas #canvas-empty").click(function() {
				$("#md-canvas-empty").dialog({
					width: 313,
					height: 200,
					resizable: false,
					modal: true,
					buttons: {
						'Nein': function() {
							$(this).dialog('close');
						},
						'Ja': function() {
							$canvasEl().empty().css("background-color", "#FFF");
							$(this).dialog('close');
						}
					}
				});
			});
			$("#canvas-tools #t-canvas #canvas-grid").click(function() {
				$canvasEl().toggleClass("grid");
			});
			$("#canvas-tools #t-canvas").buttonset();
		} catch(error) {
			G_debug("UI-Buttons can't get loaded: " + error);
		}



		// ---------------------------------------------------------------------
		// TOOLS
		$("#canvas-tools #t-tools input").bind("click", function() {
			var _buttonId = $(this).attr("id").replace("tool-", "");
			_selfCanvas.tool = _buttonId;
			switch(_buttonId) {
				case "default":
					_selfCanvas.setCanvasCursor(_buttonId);
					_selfCanvas.Properties.handleProperties(_buttonId);
					_selfCanvas.Drawing.defaultTool();
					break;
				case "text":
					_selfCanvas.setCanvasCursor(_buttonId);
					_selfCanvas.Properties.handleProperties(_buttonId);
					_selfCanvas.Drawing.addText();
					break;
				case "link":
					_selfCanvas.setCanvasCursor("text");
					_selfCanvas.Properties.handleProperties(_buttonId);
					_selfCanvas.Drawing.addLink();
					break;
				case "pen":
					_selfCanvas.setCanvasCursor(_buttonId);
					_selfCanvas.Properties.handleProperties(_buttonId);
					_selfCanvas.Drawing.drawWithPen();
					break;
				case "eraser":
					_selfCanvas.setCanvasCursor(_buttonId);
					_selfCanvas.Properties.handleProperties(_buttonId);
					_selfCanvas.Drawing.eraser();
					break;
				case "circle":
					_selfCanvas.setCanvasCursor("crosshair");
					_selfCanvas.Properties.handleProperties(_buttonId);
					_selfCanvas.Drawing.drawCircle();
					break;
				default:
					_selfCanvas.setCanvasCursor("crosshair");
					_selfCanvas.Properties.handleProperties(_buttonId);
					_selfCanvas.Drawing.drawRectangle();
					break;
			}
		});



		// ---------------------------------------------------------------------
		// PROPERTIES
		_selfCanvas.Properties = new function() {
			var _selfProp = this;

			_selfProp.propButtons = $("#canvas-tools #t-props button");

			// Set property settings
			_selfProp.settings = {
				"colorLine": "#000",
				"colorFill": "#FF0",
				"thicknessLine": "2" // + "px"
			};

			// Helper functions
			var _setThicknessLineText = function(txt) {
				_selfProp.settings.thicknessLine = txt;
				$("#canvas-tools #t-props #thickness-line .ui-button-text span").text(txt + "px");
			};
			var _setColorLineVal = function(val) {
				val = (val !== "transparent" && val.indexOf("#") == -1) ? "#" + val : val;
				_selfProp.settings.colorLine = val;
				$("#canvas-tools #t-props #color-line .ui-button-text span").css("background-color", val);
			};
			var _setColorFillVal = function(val) {
				val = (val !== "transparent" && val.indexOf("#") == -1) ? "#" + val : val;
				_selfProp.settings.colorFill = val;
				$("#canvas-tools #t-props #color-fill .ui-button-text span").css("background-color", val);
			};

			// Set initial properties
			_setThicknessLineText(_selfProp.settings.thicknessLine);
			_setColorLineVal(_selfProp.settings.colorLine);
			_setColorFillVal(_selfProp.settings.colorFill);

			// Bind events to buttons
			$("#canvas-tools #t-props #thickness-line").click(function(e) {
				// Build container if it doesnt exist already
				if ($("#thickness-line-container").length < 1) $("body").append('<div id="thickness-line-container"><a href="javascript://;" id="thickness-line-close" title="schlie&szlig;en"><span class="ui-icon ui-icon-close">schlie&szlig;en</span></a><div id="thickness-line-slider"></div></div>');
				var $mainEl = $("#thickness-line-container");
				// Position container
				var _left = e.pageX;
				var _top = e.pageY + 12;
				$mainEl.css({
					"left": _left,
					"top": _top
				}).show();
				// Add slider
				$mainEl.find("#thickness-line-slider").slider({
					value: _selfProp.settings.thicknessLine,
					min: 0,
					max: 50,
					slide: function(event, ui) {
						_setThicknessLineText(ui.value);
					}
				});
				// Close-link
				$mainEl.find("#thickness-line-close").click(function() {
					$mainEl.hide();
				});
			});
			$("#canvas-tools #t-props #color-line").mlColorPicker({'onChange': function(val) {
				_setColorLineVal(val);
			}});
			$("#canvas-tools #t-props #color-fill").mlColorPicker({'onChange': function(val) {
				_setColorFillVal(val);
			}});

			// Handle properties
			_selfProp.handleProperties = function(toolId) {
				switch(toolId) {
					case "rectangle":
					case "circle":
						_selfProp.propButtons.removeClass("ui-state-disabled ui-button-disabled").attr("disabled", "");
						break;
					case "pen":
						$("#canvas-tools #t-props #thickness-line").removeClass("ui-state-disabled ui-button-disabled").attr("disabled", "");
						$("#canvas-tools #t-props #color-line").removeClass("ui-state-disabled ui-button-disabled").attr("disabled", "");
						$("#canvas-tools #t-props #color-fill").addClass("ui-state-disabled ui-button-disabled").attr("disabled", "disabled");
						break;
					default:
						_selfProp.propButtons.addClass("ui-state-disabled ui-button-disabled").attr("disabled", "disabled");
						break;
				}
			};
			_selfProp.handleProperties();
		}();



		// ---------------------------------------------------------------------
		// CANVAS DATA HOLDER
		_selfCanvas.CanvasDataHolder = new function() {
			var _selfCanvasDataHolder = this;

			_selfCanvasDataHolder.getValue = function(attribute) {
				var _$canvasEl = $canvasEl();
				var $canvasDataHolder = _$canvasEl.find(".canvas-data-holder");

				// Check if holder exists exists
				if ($canvasDataHolder.length < 1) {
					_$canvasEl.append('<span class="canvas-data-holder"></span>');
					$canvasDataHolder = _$canvasEl.find(".canvas-data-holder");
					$canvasDataHolder.attr("data-" + attribute, "");
				}

				return $canvasDataHolder.attr("data-" + attribute);
			};

			_selfCanvasDataHolder.setValue = function(attribute, value) {
				var _$canvasEl = $canvasEl();
				var $canvasDataHolder = _$canvasEl.find(".canvas-data-holder");

				// Check if holder exists exists
				if ($canvasDataHolder.length < 1) {
					_$canvasEl.append('<span class="canvas-data-holder"></span>');
					$canvasDataHolder = _$canvasEl.find(".canvas-data-holder");
				}

				$canvasDataHolder.attr("data-" + attribute, value.toString());
			};
		}();



		// ---------------------------------------------------------------------
		// DRAWING
		_selfCanvas.Drawing = new function() {
			var _selfDrawing = this;

			// Handle z-index
			var _handleZindex = function() {
				var _zIndex = _selfCanvas.CanvasDataHolder.getValue("zindex");
				if (typeof _zIndex == "undefined") {
					_zIndex = 0;
				}
				_zIndex++;
				_selfCanvas.CanvasDataHolder.setValue("zindex", _zIndex);

				return _zIndex;
			};

			// Get mouse position
			var _getMousePosition = function(event) {
				var _offset = ($.browser.msie ? {left: 0, top: 0} : $canvasEl().offset());
				return {X: parseInt(event.clientX - _offset.left), Y: parseInt(event.clientY - _offset.top)};
			};

			// Remove saved-flag
			var _setSavedFlag = function() {
				G_selfMind.Canvas.CanvasDataHolder.setValue("save", "");
			};

			// Bind events to objects on canvas
			_selfDrawing.bindEventsToCanvasObjects = function($obj) {
				if (!$obj) return;

				$obj.bind({
					"mousedown.object": function() {
						_selfCanvas.activeObject = $obj;
						if (_selfCanvas.tool == "text" && $obj.hasClass("text-object")) {
							_selfDrawing.editText($obj);
						}
						if (_selfCanvas.tool == "link" && $obj.hasClass("link-object")) {
							var _newWin = window.open($obj.find("dd").html(), "newWindow");
							if (_newWin) {
								_newWin.focus();
							}
							return false;
						}
					},
					"mouseover.object": function() {
						$obj.addClass("object-hover");
						if (_selfCanvas.tool == "default") {
							$obj.addClass("cursor-move");
						}
						if (_selfCanvas.tool == "link" && $obj.hasClass("link-object")) {
							$obj.addClass("cursor-link");
						}
					},
					"mouseout.object": function() {
						$obj.removeClass("object-hover");
						if (_selfCanvas.tool == "default") {
							$obj.removeClass("cursor-move");
						}
						if (_selfCanvas.tool == "link" && $obj.hasClass("link-object")) {
							$obj.removeClass("cursor-link");
						}
					},
					"contextmenu.object": function(event) {
						if (_selfCanvas.tool == "default") {
							var $canvasObj = $(this);

							if ($(".contextmenu").length > 0) {
								$(".contextmenu").remove();
							}

							$canvasEl().append('<div class="contextmenu" id="canvas-contextmenu"><ul>' +
									'<li><a href="javascript://;" id="canvas-contextmenu-objectdelete">L&ouml;schen</a></li>' +
									'<li><a href="javascript://;" id="canvas-contextmenu-objecttofront">In den Vordergrund</a></li>' +
									'<li><a href="javascript://;" id="canvas-contextmenu-objecttoback">In den Hintergrund</a></li>' +
									'</ul></div>');

							var $contextmenu = $("#canvas-contextmenu");

							$contextmenu.css({
								"left": _getMousePosition(event).X,
								"top": _getMousePosition(event).Y
							});

							$("#canvas-contextmenu-objectdelete").bind("click", function() {
								$canvasObj.remove();
								$contextmenu.remove();
							});

							$("#canvas-contextmenu-objecttofront").bind("click", function() {
								$canvasObj.css("z-index", _handleZindex());
								$contextmenu.remove();
							});

							$("#canvas-contextmenu-objecttoback").bind("click", function() {
								$canvasObj.css("z-index", 0);
								$contextmenu.remove();
							});
						}
						return false;
					}
				}).draggable({
					stop: function() {
						_selfCanvas.resizeCanvas();
					}
				});
			};

			// -----------------------------------------------------------
			// Add object to canvas
			_selfDrawing.addObjectToCanvas = function(objJson) {
				var _fileName = objJson.fileName, _html = "", _title = "", _subTitle = "", _zIndex = _handleZindex(), _isImg = false;

				// Set title
				if (objJson.description != "") {
					_subTitle = '<br>' + objJson.description + ' (' + objJson.fileSize + ' Bytes)';
				} else {
					_subTitle = '<br>(' + objJson.fileSize + ' Bytes)';
				}
				_title = _fileName.split("_____")[1];

				// Set HTML
				if (objJson.fileType.indexOf("image") > -1) {
					_isImg = true;
					_html = '<img class="object-object" id="object-object-' + _zIndex + '" style="left: 30px; top: ' + Math.abs($canvasEl().offset().top) + 'px; z-index: ' + _zIndex + ';" src="' + G_pathUser + '' + objJson.userId + '/' + _fileName + '" alt="' + _title + '" title="' + _title + '">';
				} else {
					_html = '<span class="object-object" id="object-object-' + _zIndex + '" style="left: 30px; top: ' + Math.abs($canvasEl().offset().top) + 'px; z-index: ' + _zIndex + ';" title="' + _title + '"><strong>[Objekt] ' + _title + '</strong>' + _subTitle + '</span>';
				}
				
				$canvasEl().append(_html);
				var $obj = $("#object-object-" + _zIndex);

				// If image is bigger than 300x300px scale it down
				if (_isImg) {
					$obj.load(function() {
						var _imgWidth = $obj.width(), _imgHeight = $obj.height();
						var _maxWidth = 300, _maxHeight = 300;

						if (_imgWidth > _maxWidth || _imgHeight > _maxHeight) {
							// http://thingsilearned.com/2008/12/27/proportional-image-resize-in-javascript/
							var ratio = _maxHeight/_maxWidth;
							if (_imgHeight/_imgWidth > ratio){
								// If height is the problem
								if (_imgHeight > _maxHeight){
									$obj.width(Math.round(_imgWidth*(_maxHeight/_imgHeight)));
									$obj.height(_maxHeight);
								}
							} else {
								// If width is the problem
								if (_imgWidth > _maxHeight){
									$obj.height(Math.round(_imgHeight*(_maxWidth/_imgWidth)));
									$obj.width(_maxWidth);
								}
							}
							G_systemTray("Das Bild wurde auf die Maximalgr&ouml;&szlig;e von " + _maxWidth + "px x " + _maxHeight + "px skaliert.", null);
						}
					});
				}

				_selfDrawing.bindEventsToCanvasObjects($obj);
				_setSavedFlag();
				_selfCanvas.resizeCanvas();
			};
			// Remove object from canvas
			_selfDrawing.removeObjectFromCanvas = function(fileName) {
				var _src = null;
				$canvasEl().find(".object-object").each(function() {
					_src = $(this).attr("src");
					if (_src) { // Images
						if (_src.indexOf(fileName) > -1) {
							$(this).remove();
						}
					} else { // Everything else
						if ($(this).html().indexOf(fileName.split("_____")[1]) > -1) {
							$(this).remove();
						}
					}
				});

				_setSavedFlag();
				_selfCanvas.resizeCanvas();
			};

			// -----------------------------------------------------------
			// Default tool (canvas dragging, ...)
			_selfDrawing.defaultTool = function() {
				$canvasEl().unbind(".drawing .eraser").children().unbind(".eraser");
			};

			// Add text
			_selfDrawing.addText = function() {
				var $drawText = null;
				var $drawTextWriting = null;
				var _writing = false;
				var _zIndex = 0;
				var _startX = 0;
				var _startY = 0;
				var _stopX = 0;
				var _stopY = 0;
				var _left = 0;
				var _top = 0;
				var _right = 0;
				var _bottom = 0;

				$canvasEl().unbind(".drawing .eraser").bind({
					"mousedown.drawing": function(event) {
						if (_writing) return;

						_zIndex = _handleZindex();
						_startX = _getMousePosition(event).X;
						_startY = _getMousePosition(event).Y;

						$(this).append('<div class="text-object" id="text-object-' + _zIndex + '" style="border: dotted 1px #79B7E7; left: ' + _getMousePosition(event).X + 'px; top: ' + _getMousePosition(event).Y + 'px; z-index: ' + _zIndex + ';"></div>');
						$drawText = $("#text-object-" + _zIndex);
						$drawTextWriting = $drawText;
					},
					"mousemove.drawing": function(event) {
						if (!$drawText || _writing) return;

						_stopX = _getMousePosition(event).X;
						_stopY = _getMousePosition(event).Y;
						_left = Math.min(_startX, _stopX);
						_top = Math.min(_startY, _stopY);
						_right = Math.max(_startX, _stopX);
						_bottom = Math.max(_startY, _stopY);

						$drawText.css({
							"left": _left,
							"top": _top,
							"width": (_right - _left),
							"height": (_bottom - _top) + 20
						});
					},
					"mouseup.drawing": function(event) {
						if (!$drawText) return;

						_stopX = _getMousePosition(event).X;
						_stopY = _getMousePosition(event).Y;
						_left = Math.min(_startX, _stopX);
						_top = Math.min(_startY, _stopY);
						_right = Math.max(_startX, _stopX);
						_bottom = Math.max(_startY, _stopY);
						var _rteWidth = (_right - _left) - 2;
						var _rteHeight = (_bottom - _top) - 100;

						// In case the user didnt move the mouse (just clicked on the canvas) or the rectangle is smaller than the default values, we need to set the values on mouseup to the default values
						if ((_right == _left || _right - _left < 300) && (_bottom == _top || _bottom - _top < 250)) {
							$drawText.css({
								"width": 300,
								"height": 250
							});
							_rteWidth = 298;
							_rteHeight = 100;
						}

						// Add rte inside $drawText
						_writing = true;
						var _color = "";
						$drawText.append('<div id="mind-canvas-addtext"><a href="javascript://;" id="addtext-close" title="schlie&szlig;en"><span class="ui-icon ui-icon-close">schlie&szlig;en</span></a><form action="#" method="post"><textarea cols="20" rows="4"></textarea><button>Text speichern</button></form></div>');
						var $mainEl = $("#mind-canvas-addtext");
						var $textareaEl = $mainEl.find("textarea");
						// Create rte (textarea ist getting replaced with rte)
						// todo: fix rte so that we can set the color on different texts in one rte
						$textareaEl.rte({
							controls_rte: {
								s1:{separator:true},
								bold:{command:"bold",tags:["b","strong"]},
								italic:{command:"italic",tags:["i","em"]},
								strikeThrough:{command:"strikethrough",tags:["s","strike"]},
								underline:{command:"underline",tags:["u"]},
								s2:{separator:true},
								justifyLeft:{command:"justifyleft"},
								justifyCenter:{command:"justifycenter"},
								justifyRight:{command:"justifyright"},
								justifyFull:{command:"justifyfull"},
								s3:{separator:true},
								indent:{command:"indent"},
								outdent:{command:"outdent"},
								s4:{separator:true},
								subscript:{command:"subscript",tags:["sub"]},
								superscript:{command:"superscript",tags:["sup"]},
								s5:{separator:true},
								orderedList:{command:"insertorderedlist",tags:["ol"]},
								unorderedList:{command:"insertunorderedlist",tags:["ul"]},
								s6:{separator:true},
								size:{command:"fontsize",select:'<select>	<option value="">-Schriftgr&ouml;&szlig;e-</option>	<option value="1">1 (8pt)</option>	<option value="2">2 (10pt)</option>	<option value="3">3 (12pt)</option>	<option value="4">4 (14pt)</option>	<option value="5">5 (16pt)</option>	<option value="6">6 (18pt)</option>	<option value="7">7 (20pt)</option></select>',tags:["font"]},
								color:{exec: function() {
									// Textcolor is getting set a few lines below ...
								},hint: "Textfarbe (ganzes Textfeld)"}
							},
							"width": _rteWidth,
							"height": _rteHeight
						});
						// Textcolor
						$(".rte-toolbar a[rel='color']").mlColorPicker({'onChange': function(val) {
							_color = "#" + val;
							$(getIframeContent()).css("color", _color);
						}});
						// Bind event to submit button
						$mainEl.find("button").button().bind("click keyup", function() {
							setContent();
							return false;
						});
						// Close icon
						$mainEl.find("#addtext-close").click(function() {
							setContent();
							return false;
						});
						// Get value from textarea and write it into $drawText/$drawTextWriting
						function setContent() {
							try {
								var _cnt = $(getIframeContent()).html();
								$drawTextWriting.css("color", _color).html(_cnt);
								_selfDrawing.bindEventsToCanvasObjects($drawTextWriting);
								_selfCanvas.resizeCanvas();
							} catch(error) {
								G_debug("Couldn't get content from rte: " + error);
							}
							closeRTE();
						}
						// Add close functionality
						function closeRTE() {
							$drawTextWriting.css("height", "auto"); // Set height to auto so content can define the height
							$drawTextWriting = null;
							_writing = false;
							_color = "";
							$mainEl.remove();
						}
						// Get iframe content
						function getIframeContent() {
							var _iframe = document.getElementsByTagName("iframe")[0];
							return (typeof _iframe == "object") ? _iframe.contentWindow.document.body : null;
						}

						// Set vars back
						$drawText.css("border", "none").css("height", $(this).css("height") + 100); // Remove border and add 100px height cause of rte's bigger dimensions
						$drawText = null;
						_startX = 0;
						_startY = 0;
						_stopX = 0;
						_stopY = 0;
						_left = 0;
						_top = 0;
						_right = 0;
						_bottom = 0;
					}
				}).children().unbind(".eraser");
			};

			_selfDrawing.editText = function($textObject) {
				$textObject.unbind(".object");
				$canvasEl().unbind(".drawing .eraser");

				var _rteWidth = parseInt($textObject.css("width")) - 2;
				var _origHeight = $textObject.css("height");
				$textObject.css("height", parseInt(_origHeight) + 110).css("z-index", _handleZindex());
				var _color = "";
				var _origContent = $textObject.html();
				$textObject.html("").append('<div id="mind-canvas-addtext"><a href="javascript://;" id="addtext-close" title="schlie&szlig;en"><span class="ui-icon ui-icon-close">schlie&szlig;en</span></a><form action="#" method="post"><textarea cols="20" rows="4"></textarea><button>Text speichern</button></form></div>');
				var $mainEl = $("#mind-canvas-addtext");
				var $textareaEl = $mainEl.find("textarea");
				$textareaEl.html(_origContent);
				// Create rte (textarea ist getting replaced with rte)
				$textareaEl.rte({
					controls_rte: {
						s1:{separator:true},
						bold:{command:"bold",tags:["b","strong"]},
						italic:{command:"italic",tags:["i","em"]},
						strikeThrough:{command:"strikethrough",tags:["s","strike"]},
						underline:{command:"underline",tags:["u"]},
						s2:{separator:true},
						justifyLeft:{command:"justifyleft"},
						justifyCenter:{command:"justifycenter"},
						justifyRight:{command:"justifyright"},
						justifyFull:{command:"justifyfull"},
						s3:{separator:true},
						indent:{command:"indent"},
						outdent:{command:"outdent"},
						s4:{separator:true},
						subscript:{command:"subscript",tags:["sub"]},
						superscript:{command:"superscript",tags:["sup"]},
						s5:{separator:true},
						orderedList:{command:"insertorderedlist",tags:["ol"]},
						unorderedList:{command:"insertunorderedlist",tags:["ul"]},
						s6:{separator:true},
						size:{command:"fontsize",select:'<select>	<option value="">-Schriftgr&ouml;&szlig;e-</option>	<option value="1">1 (8pt)</option>	<option value="2">2 (10pt)</option>	<option value="3">3 (12pt)</option>	<option value="4">4 (14pt)</option>	<option value="5">5 (16pt)</option>	<option value="6">6 (18pt)</option>	<option value="7">7 (20pt)</option></select>',tags:["font"]},
						color:{exec: function() {
							// Textcolor is getting set a few lines below ...
						},hint: "Textfarbe (ganzes Textfeld)"}
					},
					"width": _rteWidth,
					"height": _origHeight
				});
				// Textcolor
				$(".rte-toolbar a[rel='color']").mlColorPicker({'onChange': function(val) {
					_color = "#" + val;
					$(getIframeContent()).css("color", _color);
				}});
				$(getIframeContent()).css("color", $textObject.css("color"));
				// Bind event to submit button
				$mainEl.find("button").button().bind("click keyup", function() {
					setContent();
					return false;
				});
				// Close icon
				$mainEl.find("#addtext-close").click(function() {
					setContent();
					return false;
				});
				// Get value from textarea and write it into $drawText/$drawTextWriting
				function setContent() {
					try {
						var _cnt = $(getIframeContent()).html();
						$textObject.css("color", _color).html(_cnt);
						_selfDrawing.bindEventsToCanvasObjects($textObject);
						_selfCanvas.resizeCanvas();
					} catch(error) {
						G_debug("Couldn't get content from rte: " + error);
					}
					closeRTE();
				}
				// Add close functionality
				function closeRTE() {
					$textObject.css("height", _origHeight);
					_color = "";
					$mainEl.remove();
					_selfDrawing.addText();
				}
				// Get iframe content
				function getIframeContent() {
					var _iframe = document.getElementsByTagName("iframe")[0];
					return (typeof _iframe == "object") ? _iframe.contentWindow.document.body : null;
				}
			};

			// Add link
			_selfDrawing.addLink = function() {
				var _zIndex = 0;
				var _startX = 0;
				var _startY = 0;

				$canvasEl().unbind(".drawing .eraser").bind({
					"mousedown.drawing": function(event) {
						var $cEl = $(this);
						_zIndex = _handleZindex();
						_startX = _getMousePosition(event).X;
						_startY = _getMousePosition(event).Y;

						var $newLinkURL = $("#new-link-url");
						var $newLinkName = $("#new-link-name");

						// Dialog
						$("#md-new-link").dialog({
							width: 313,
							height: 320,
							resizable: false,
							modal: false,
							buttons: {
								'Abbrechen': function() {
									$(this).dialog('close');
								},
								'Speichern': function() {
									if ($newLinkName.val() === "") {
										if (_getLinkInfo()) {
											_createLinkObject();
											$(this).dialog('close');
										} else {
											return false;
										}
									} else {
										_createLinkObject();
										$(this).dialog('close');
									}
								}
							},
							open: function() {
								var $dialog = $(this);
								$dialog.find("form").submit(function() {
									//$dialog.next().find("button:contains('Speichern')").trigger("click");
									return false;
								});
								$newLinkURL.select();
							},
							close: function() {
								$newLinkURL.val("http://");
								$newLinkName.val("");
							}
						});

						// Get link info
						var _getLinkInfo = function() {
							$newLinkName.addClass("loader-small").val("hole Daten ...");
							$.ajax({
								type: "GET",
								url: G_pathController + "Objects.php?action=getLinkInfo&url=" + $newLinkURL.val(),
								success: function(response) {
									$newLinkName.removeClass("loader-small").val(response).select();
									return true;
								},
								error: function(response) {
									$newLinkName.removeClass("loader-small").val("");
									G_systemTray("Ein Fehler ist aufgetreten. Bitte wiederholen Sie den Vorgang. (" + response + ")", "error");
									return false;
								}
							});
						};

						// Create link object
						var _createLinkObject = function() {
							$cEl.append('<div class="link-object" id="link-object-' + _zIndex + '" style="left: ' + _getMousePosition(event).X + 'px; top: ' + _getMousePosition(event).Y + 'px; z-index: ' + _zIndex + ';">' +
									'<dl><dt>[Link] ' + $newLinkName.val() + '</dt><dd>' + $newLinkURL.val() + '</dd></dl>' +
									'</div>');
							_selfDrawing.bindEventsToCanvasObjects($("#link-object-" + _zIndex));
							_selfCanvas.resizeCanvas();
						};
					},
					"mouseup.drawing": function() {
						// This is a workaround because the select on dialog.open is not get triggered on mousedown
						$("#new-link-url").select();
					}
				}).children().unbind(".eraser");
			};

			// Draw with pen
			_selfDrawing.drawWithPen = function() {
				var _penDrawing = false;
				var _zIndex = 0;
				var _thicknessLine = _selfCanvas.Properties.settings.thicknessLine;
				var _oldPosX = 0;
				var _oldPosY = 0;
				var _diffPosX = 0;
				var _diffPosY = 0;
				var _newPosX = 0;
				var _newPosY = 0;
				var i = 0;

				$canvasEl().unbind(".drawing .eraser").bind({
					"mousedown.drawing": function(event) {
						_zIndex = _handleZindex();
						_thicknessLine = _selfCanvas.Properties.settings.thicknessLine;
						$(this).append('<span class="pen-object" id="pen-object-' + _zIndex + '" style="background-color: ' + _selfCanvas.Properties.settings.colorLine + '; height: ' + _thicknessLine + 'px; left: ' + _getMousePosition(event).X + 'px; top: ' + _getMousePosition(event).Y + 'px; width: ' + _thicknessLine + 'px; z-index: ' + _zIndex + ';"></span>');
						_penDrawing = true;
					},
					"mousemove.drawing": function(event) {
						if (!_penDrawing) return;
						_zIndex = _handleZindex();
						_thicknessLine = _selfCanvas.Properties.settings.thicknessLine;

						// Calculation for unpainted spans/empty space between spans
						/*if (_oldPosX !== 0 && _oldPosY !== 0) {
							G_debug(_getMousePosition(event).X + " | " + _getMousePosition(event).Y + " || " + _oldPosX + " | " + _oldPosY);
							if (_getMousePosition(event).X - _oldPosX > _thicknessLine || _getMousePosition(event).Y - _oldPosY > _thicknessLine) {
								_diffPosX = Math.abs(_getMousePosition(event).X - _oldPosX);
								_diffPosY = Math.abs(_getMousePosition(event).Y - _oldPosY);
								G_debug("too far away: " + _diffPosX + " | " + _diffPosY);
								for (i = 0; i < _diffPosX; i++) {
									_newPosX = _oldPosX - i;
									_newPosY = _oldPosY + _diffPosY;
									$(this).append('<span class="pen-object dodo" id="pen-object-' + _zIndex + '" style="background-color: ' + _selfCanvas.Properties.settings.colorLine + '; height: ' + _thicknessLine + 'px; left: ' + _newPosX + 'px; top: ' + _newPosY + 'px; width: ' + _thicknessLine + 'px; z-index: ' + _zIndex + ';"></span>');
								}
							}
						}*/

						$(this).append('<span class="pen-object" id="pen-object-' + _zIndex + '" style="background-color: ' + _selfCanvas.Properties.settings.colorLine + '; height: ' + _thicknessLine + 'px; left: ' + _getMousePosition(event).X + 'px; top: ' + _getMousePosition(event).Y + 'px; width: ' + _thicknessLine + 'px; z-index: ' + _zIndex + ';"></span>');
						_oldPosX = _getMousePosition(event).X;
						_oldPosY = _getMousePosition(event).Y;
					},
					"mouseup.drawing": function() {
						_penDrawing = false;
						_zIndex = 0;
						_diffPosX = 0;
						_diffPosY = 0;
						_newPosX = 0;
						_newPosY = 0;
						i = 0;
					}
				}).children().unbind(".eraser");
			};

			// Draw rectangle - rectangle and circle are really similar
			_selfDrawing.drawRectangle = function() {
				var $drawRect = null;
				var _zIndex = 0;
				var _startX = 0;
				var _startY = 0;
				var _stopX = 0;
				var _stopY = 0;
				var _left = 0;
				var _top = 0;
				var _right = 0;
				var _bottom = 0;
				var _thicknessLine = 0;

				$canvasEl().unbind(".drawing .eraser").bind({
					"mousedown.drawing": function(event) {
						_zIndex = _handleZindex();
						_startX = _getMousePosition(event).X;
						_startY = _getMousePosition(event).Y;
						_thicknessLine = _selfCanvas.Properties.settings.thicknessLine;

						$(this).append('<div class="rectangle-object" id="rectangle-object-' + _zIndex + '" style="background-color: ' + _selfCanvas.Properties.settings.colorFill + '; border-color: ' + _selfCanvas.Properties.settings.colorLine + '; border-width: ' + _thicknessLine + 'px; left: ' + _getMousePosition(event).X + 'px; top: ' + _getMousePosition(event).Y + 'px; z-index: ' + _zIndex + ';"></div>');
						$drawRect = $("#rectangle-object-" + _zIndex);
					},
					"mousemove.drawing": function(event) {
						if (!$drawRect) return;

						_stopX = _getMousePosition(event).X;
						_stopY = _getMousePosition(event).Y;
						_left = Math.min(_startX, _stopX);
						_top = Math.min(_startY, _stopY);
						_right = Math.max(_startX, _stopX);
						_bottom = Math.max(_startY, _stopY);

						$drawRect.css({
							"left": _left,
							"top": _top,
							"width": (_right - _left) - (_thicknessLine * 2),
							"height": (_bottom - _top) - (_thicknessLine * 2)
						});
					},
					"mouseup.drawing": function() {
						_selfDrawing.bindEventsToCanvasObjects($drawRect);
						_selfCanvas.resizeCanvas();
						$drawRect = null;
						_startX = 0;
						_startY = 0;
						_stopX = 0;
						_stopY = 0;
						_left = 0;
						_top = 0;
						_right = 0;
						_bottom = 0;
						_thicknessLine = 0;
					}
				}).children().unbind(".eraser");
			};

			// Draw circle - circle and rectangle are really similar
			_selfDrawing.drawCircle = function() {
				var $drawCircle = null;
				var _zIndex = 0;
				var _startX = 0;
				var _startY = 0;
				var _stopX = 0;
				var _stopY = 0;
				var _left = 0;
				var _top = 0;
				var _right = 0;
				var _bottom = 0;

				$canvasEl().unbind(".drawing .eraser").bind({
					"mousedown.drawing": function(event) {
						_zIndex = _handleZindex();
						_startX = _getMousePosition(event).X;
						_startY = _getMousePosition(event).Y;

						$(this).append('<div class="circle-object" id="circle-object-' + _zIndex + '" style="background-color: ' + _selfCanvas.Properties.settings.colorFill + '; border-color: ' + _selfCanvas.Properties.settings.colorLine + '; border-width: ' + _selfCanvas.Properties.settings.thicknessLine + 'px; left: ' + _getMousePosition(event).X + 'px; top: ' + _getMousePosition(event).Y + 'px; z-index: ' + _zIndex + ';"></div>');
						$drawCircle = $("#circle-object-" + _zIndex);
					},
					"mousemove.drawing": function(event) {
						if (!$drawCircle) return;

						_stopX = _getMousePosition(event).X;
						_stopY = _getMousePosition(event).Y;
						_left = Math.min(_startX, _stopX);
						_top = Math.min(_startY, _stopY);
						_right = Math.max(_startX, _stopX);
						_bottom = Math.max(_startY, _stopY);

						$drawCircle.css({
							"left": _left,
							"top": _top,
							"width": (_right - _left),
							"height": (_bottom - _top)
						});
					},
					"mouseup.drawing": function() {
						_selfDrawing.bindEventsToCanvasObjects($drawCircle);
						_selfCanvas.resizeCanvas();
						$drawCircle = null;
						_startX = 0;
						_startY = 0;
						_stopX = 0;
						_stopY = 0;
						_left = 0;
						_top = 0;
						_right = 0;
						_bottom = 0;
					}
				}).children().unbind(".eraser");
			};

			// Eraser
			_selfDrawing.eraser = function() {
				var _erasing = false;

				$canvasEl().unbind(".drawing .eraser").bind({
					"mouseup.eraser": function() {
						_erasing = false;
					}
				}).children().unbind(".eraser").bind({
					"mousedown.eraser": function() {
						$(this).remove();
						_erasing = true;
					},
					"mousemove.eraser": function() {
						if (!_erasing) return;
						$(this).remove();
					}
				});
			};
		};



		// -------------------------------------------------------------------------
		// CHAT
		G_selfMind.Chat = new function() {
			var _selfChat = this;

			var $chat = $("#chat");
			// todo: implement chat (sending, receiving; real time-editing of canvas) - needs to be individual for every open thought

			$("#chat button").button();
			$("#chat form").submit(function() {

			});

			$("#chat-close").click(function() {
				$chat.fadeOut("normal", function() {
					_setUpStage();
				});
			});
		}();
	}();



	// Set up stage again - this is more like a hack because somehow the stage won't get set up until the end of the script
	_setUpStage();



	// Get session data and update interface - due to race conditions this needs to be at the end of the script AND due to the ajax request this needs an interval (both shouldn't be delaying the interface)
	var _sessionInterval = window.setInterval(function() {
		if (G_selfMind.User.sessionData) {
			window.clearInterval(_sessionInterval);

			var _sessionData = G_selfMind.User.sessionData;

			// Open label
			G_selfMind.LabelList.selectLabelWrapper(_sessionData.OpenLabel);

			// Open thoughts
			var _openThoughts = _sessionData.OpenThoughts;
			_openThoughts = _openThoughts.split(",");
			G_selfMind.OpenThoughts.openMultipleThoughts(_openThoughts, _sessionData.OpenThought);
		}
	}, 200);
}();
