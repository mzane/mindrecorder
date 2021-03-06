jQuery.fn.rte = function(a, b) {
	if (!b || b.constructor != Array) {
		b = new Array()
	}
	$(this).each(function(c) {
		var d = (this.id) ? this.id : b.length;
		b[d] = new lwRTE(this, a || {})
	});
	return b
};
var lwRTE_resizer = function(a) {
	this.drag = false;
	this.rte_zone = $(a).parents(".rte-zone")
};
lwRTE_resizer.mousedown = function(b, a) {
	b.drag = true;
	b.event = (typeof(a) == "undefined") ? window.event : a;
	b.rte_obj = $(".rte-resizer", b.rte_zone).prev().eq(0);
	$("body", document).css("cursor", "se-resize");
	return false
};
lwRTE_resizer.mouseup = function(b, a) {
	b.drag = false;
	$("body", document).css("cursor", "auto");
	return false
};
lwRTE_resizer.mousemove = function(d, c) {
	if (d.drag) {
		c = (typeof(c) == "undefined") ? window.event : c;
		var a = Math.max(1, d.rte_zone.width() + c.screenX - d.event.screenX);
		var b = Math.max(1, d.rte_obj.height() + c.screenY - d.event.screenY);
		d.rte_zone.width(a);
		d.rte_obj.height(b);
		d.event = c
	}
	return false
};
var lwRTE = function(a, b) {
	this.css = [];
	this.css_class = b.frame_class || "";
	this.base_url = b.base_url || "";
	this.width = b.width || $(a).width() || "100%";
	this.height = b.height || $(a).height() || 350;
	this.iframe = null;
	this.iframe_doc = null;
	this.textarea = null;
	this.event = null;
	this.range = null;
	this.toolbars = {rte:"",html:""};
	this.controls = {rte:{disable:{hint:"Source editor"}},html:{enable:{hint:"Visual editor"}}};
	$.extend(this.controls.rte, b.controls_rte || {});
	$.extend(this.controls.html, b.controls_html || {});
	$.extend(this.css, b.css || {});
	if (document.designMode || document.contentEditable) {
		$(a).wrap($("<div></div>").addClass("rte-zone").width(this.width));
		/*$('<div class="rte-resizer"><a href="#"></a></div>').insertAfter(a);
		var c = new lwRTE_resizer(a);
		$(".rte-resizer a", $(a).parents(".rte-zone")).mousedown(function(d) {
			$(document).mousemove(function(f) {
				return lwRTE_resizer.mousemove(c, f)
			});
			$(document).mouseup(function(f) {
				return lwRTE_resizer.mouseup(c, f)
			});
			return lwRTE_resizer.mousedown(c, d)
		});*/
		this.textarea = a;
		this.enable_design_mode()
	}
};
lwRTE.prototype.editor_cmd = function(c, a) {
	this.iframe.contentWindow.focus();
	try {
		this.iframe_doc.execCommand(c, false, a)
	} catch(b) {
	}
	this.iframe.contentWindow.focus()
};
lwRTE.prototype.get_toolbar = function() {
	var a = (this.iframe) ? $(this.iframe) : $(this.textarea);
	return(a.prev().hasClass("rte-toolbar")) ? a.prev() : null
};
lwRTE.prototype.activate_toolbar = function(c, a) {
	var b = this.get_toolbar();
	if (b) {
		b.remove()
	}
	$(c).before($(a).clone(true))
};
lwRTE.prototype.enable_design_mode = function() {
	var a = this;
	a.iframe = document.createElement("iframe");
	a.iframe.frameBorder = 0;
	a.iframe.frameMargin = 0;
	a.iframe.framePadding = 0;
	a.iframe.width = "100%";
	a.iframe.height = a.height || "100%";
	a.iframe.src = "javascript:void(0);";
	if ($(a.textarea).attr("class")) {
		a.iframe.className = $(a.textarea).attr("class")
	}
	if ($(a.textarea).attr("id")) {
		a.iframe.id = $(a.textarea).attr("id")
	}
	if ($(a.textarea).attr("name")) {
		a.iframe.title = $(a.textarea).attr("name")
	}
	var f = $(a.textarea).val();
	$(a.textarea).hide().after(a.iframe).remove();
	a.textarea = null;
	var c = "";
	for (var b in a.css) {
		c += "<link type='text/css' rel='stylesheet' href='" + a.css[b] + "' />"
	}
	c += '<style type="text/css">html {font: normal 12px/1 arial,verdana,helvetica,sans-serif;}</style>'; // inserted default text-style (by mkrumm)
	var g = (a.base_url) ? "<base href='" + a.base_url + "' />" : "";
	var d = (a.css_class) ? "class='" + a.css_class + "'" : "";
	var j = "<html><head>" + g + c + "</head><body " + d + " style='padding:5px'>" + f + "</body></html>";
	a.iframe_doc = a.iframe.contentWindow.document;
	try {
		a.iframe_doc.designMode = "on"
	} catch(h) {
		$(a.iframe_doc).focus(function() {
			a.iframe_doc.designMode()
		})
	}
	a.iframe_doc.open();
	a.iframe_doc.write(j);
	a.iframe_doc.close();
	if (!a.toolbars.rte) {
		a.toolbars.rte = a.create_toolbar(a.controls.rte)
	}
	a.activate_toolbar(a.iframe, a.toolbars.rte);
	$(a.iframe).parents("form").submit(function() {
		a.disable_design_mode(true)
	});
	$(a.iframe_doc).mouseup(function(e) {
		if (a.iframe_doc.selection) {
			a.range = a.iframe_doc.selection.createRange()
		}
		a.set_selected_controls((e.target) ? e.target : e.srcElement, a.controls.rte)
	});
	$(a.iframe_doc).blur(function(e) {
		if (a.iframe_doc.selection) {
			a.range = a.iframe_doc.selection.createRange()
		}
	});
	$(a.iframe_doc).keyup(function(e) {
		a.set_selected_controls(a.get_selected_element(), a.controls.rte)
	});
	if (!$.browser.msie) {
		a.editor_cmd("styleWithCSS", false)
	}
};
lwRTE.prototype.disable_design_mode = function(b) {
	var a = this;
	a.textarea = (b) ? $('<input type="hidden" />').get(0) : $("<textarea></textarea>").width("100%").height(a.height).get(0);
	if (a.iframe.className) {
		a.textarea.className = a.iframe.className
	}
	if (a.iframe.id) {
		a.textarea.id = a.iframe.id
	}
	if (a.iframe.title) {
		a.textarea.name = a.iframe.title
	}
	$(a.textarea).val($("body", a.iframe_doc).html());
	$(a.iframe).before(a.textarea);
	if (!a.toolbars.html) {
		a.toolbars.html = a.create_toolbar(a.controls.html)
	}
	if (b != true) {
		$(a.iframe_doc).remove();
		$(a.iframe).remove();
		a.iframe = a.iframe_doc = null;
		a.activate_toolbar(a.textarea, a.toolbars.html)
	}
};
lwRTE.prototype.toolbar_click = function(f, d) {
	var b = d.exec;
	var a = d.args || [];
	var g = (f.tagName.toUpperCase() == "SELECT");
	$(".rte-panel", this.get_toolbar()).remove();
	if (b) {
		if (g) {
			a.push(f)
		}
		try {
			b.apply(this, a)
		} catch(c) {
		}
	} else {
		if (this.iframe && d.command) {
			if (g) {
				a = f.options[f.selectedIndex].value;
				if (a.length <= 0) {
					return
				}
			}
			this.editor_cmd(d.command, a)
		}
	}
};
lwRTE.prototype.create_toolbar = function(d) {
	var c = this;
	var b = $("<div></div>").addClass("rte-toolbar").width("100%").append($("<ul></ul>")).append($("<div></div>").addClass("clear"));
	var h,a;
	for (var f in d) {
		if (d[f].separator) {
			a = $("<li></li>").addClass("separator")
		} else {
			if (d[f].init) {
				try {
					d[f].init.apply(d[f], [this])
				} catch(g) {
				}
			}
			if (d[f].select) {
				h = $(d[f].select).change(function(i) {
					c.event = i;
					c.toolbar_click(this, d[this.className]);
					return false
				})
			} else {
				h = $("<a href='#'></a>").attr("title", (d[f].hint) ? d[f].hint : f).attr("rel", f).click(function(i) {
					c.event = i;
					c.toolbar_click(this, d[this.rel]);
					return false
				})
			}
			a = $("<li></li>").append(h.addClass(f))
		}
		$("ul", b).append(a)
	}
	$(".enable", b).click(function() {
		c.enable_design_mode();
		return false
	});
	$(".disable", b).click(function() {
		c.disable_design_mode();
		return false
	});
	return b.get(0)
};
lwRTE.prototype.create_panel = function(h, c) {
	var i = this;
	var e = i.get_toolbar();
	if (!e) {
		return false
	}
	$(".rte-panel", e).remove();
	var f,b;
	var d = i.event.pageX;
	var g = i.event.pageY;
	var a = $("<div></div>").hide().addClass("rte-panel").css({left:d,top:g});
	$("<div></div>").addClass("rte-panel-title").html(h).append($("<a class='close' href='#'>X</a>").click(function() {
		a.remove();
		return false
	})).mousedown(function() {
		f = true;
		return false
	}).mouseup(function() {
		f = false;
		return false
	}).mousemove(function(j) {
		if (f && b) {
			d -= b.pageX - j.pageX;
			g -= b.pageY - j.pageY;
			a.css({left:d,top:g})
		}
		b = j;
		return false
	}).appendTo(a);
	if (c) {
		a.width(c)
	}
	e.append(a);
	return a
};
lwRTE.prototype.get_content = function() {
	return(this.iframe) ? $("body", this.iframe_doc).html() : $(this.textarea).val()
};
lwRTE.prototype.set_content = function(a) {
	(this.iframe) ? $("body", this.iframe_doc).html(a) : $(this.textarea).val(a)
};
lwRTE.prototype.set_selected_controls = function(b, l) {
	var h = this.get_toolbar();
	if (!h) {
		return false
	}
	var k,a,d,f,m,c,j;
	try {
		for (k in l) {
			f = l[k];
			d = $("." + k, h);
			d.removeClass("active");
			if (!f.tags) {
				continue
			}
			a = b;
			do{
				if (a.nodeType != 1) {
					continue
				}
				m = a.nodeName.toLowerCase();
				if ($.inArray(m, f.tags) < 0) {
					continue
				}
				if (f.select) {
					d = d.get(0);
					if (d.tagName.toUpperCase() == "SELECT") {
						d.selectedIndex = 0;
						for (c = 0; c < d.options.length; c++) {
							j = d.options[c].value;
							if (j && ((f.tag_cmp && f.tag_cmp(a, j)) || m == j)) {
								d.selectedIndex = c;
								break
							}
						}
					}
				} else {
					d.addClass("active")
				}
			} while (a = a.parentNode)
		}
	} catch(g) {
	}
	return true
};
lwRTE.prototype.get_selected_element = function() {
	var c,b,a;
	var d = this.iframe.contentWindow;
	if (d.getSelection) {
		try {
			b = d.getSelection();
			a = b.getRangeAt(0);
			c = a.commonAncestorContainer
		} catch(f) {
			return false
		}
	} else {
		try {
			b = d.document.selection;
			a = b.createRange();
			c = a.parentElement()
		} catch(f) {
			return false
		}
	}
	return c
};
lwRTE.prototype.get_selection_range = function() {
	var a = null;
	var c = this.iframe.contentWindow;
	this.iframe.focus();
	if (c.getSelection) {
		a = c.getSelection().getRangeAt(0);
		if ($.browser.opera) {
			var b = a.startContainer;
			if (b.nodeType === Node.TEXT_NODE) {
				a.setStartBefore(b.parentNode)
			}
		}
	} else {
		this.range.select();
		a = this.iframe_doc.selection.createRange()
	}
	return a
};
lwRTE.prototype.get_selected_text = function() {
	var a = this.iframe.contentWindow;
	if (a.getSelection) {
		return a.getSelection().toString()
	}
	this.range.select();
	return a.document.selection.createRange().text
};
lwRTE.prototype.get_selected_html = function() {
	var b = null;
	var d = this.iframe.contentWindow;
	var a = this.get_selection_range();
	if (a) {
		if (d.getSelection) {
			var c = document.createElement("div");
			c.appendChild(a.cloneContents());
			b = c.innerHTML
		} else {
			b = a.htmlText
		}
	}
	return b
};
lwRTE.prototype.selection_replace_with = function(b) {
	var a = this.get_selection_range();
	var c = this.iframe.contentWindow;
	if (!a) {
		return
	}
	this.editor_cmd("removeFormat");
	if (c.getSelection) {
		a.deleteContents();
		a.insertNode(a.createContextualFragment(b));
		this.editor_cmd("delete")
	} else {
		this.editor_cmd("delete");
		a.pasteHTML(b)
	}
};