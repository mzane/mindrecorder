/**
 * @author mlambir
 *
 * @IMPORTANT Several changes have been made !!!
 */

(function($) {
	var rgbRE = /^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/;
	var colorRE = /^[a-fA-F0-9]{6}|[a-fA-F0-9]{3}$/;
	// Timeout for closing
	var to = null;
	
	function mouseEnterColor(event){
		var rgbString = $(event.target).css("background-color");
		var parts = rgbString.match(rgbRE);
		if(parts!=null){
			delete (parts[0]);
			for (var i = 1; i <= 3; ++i) {
				parts[i] = parseInt(parts[i]).toString(16);
				if (parts[i].length == 1) parts[i] = '0' + parts[i];
			}
			var hexString = parts.join('');
			$("#mlSelectedColorText").val(hexString).keyup();
		}else{
			$("#mlSelectedColorText").val(rgbString.substring(1)).keyup();
		}
		window.clearTimeout(to);
	}
	function mouseClickColor(){
		colorSave();
	}
	function textKeyUp(event){
		var color = $(event.target).val();
		if (color.match(colorRE)) {
			colorChange(color)
		}
		if (event.keyCode == 13) {//enter
			colorSave()
		}
	}
	function colorChange(color){
		$("#mlSelectedColorDiv").css("background-color", "#"+color);
	}
	function colorSave(){
		if ($("#mlColorPicker").data("mlOnChange")) {
			var color = $("#mlSelectedColorText").val();
			if (color.match(colorRE)) {
				$("#mlColorPicker").data("mlOnChange")(color);
				close()
			}
		}
	}

	function close(){
		$("#mlColorPicker").hide().removeData("mlOnChange");
	}

	function createColorPicker(){
		var colors = ["#000000","#000000","#000000","#003300","#006600","#009900","#00CC00","#00FF00","#330000","#333300","#336600","#339900","#33CC00","#33FF00","#660000","#663300","#666600","#669900","#66CC00","#66FF00","#333333","#000000","#000033","#003333","#006633","#009933","#00CC33","#00FF33","#330033","#333333","#336633","#339933","#33CC33","#33FF33","#660033","#663333","#666633","#669933","#66CC33","#66FF33","#666666","#000000","#000066","#003366","#006666","#009966","#00CC66","#00FF66","#330066","#333366","#336666","#339966","#33CC66","#33FF66","#660066","#663366","#666666","#669966","#66CC66","#66FF66","#999999","#000000","#000099","#003399","#006699","#009999","#00CC99","#00FF99","#330099","#333399","#336699","#339999","#33CC99","#33FF99","#660099","#663399","#666699","#669999","#66CC99","#66FF99","#CCCCCC","#000000","#0000CC","#0033CC","#0066CC","#0099CC","#00CCCC","#00FFCC","#3300CC","#3333CC","#3366CC","#3399CC","#33CCCC","#33FFCC","#6600CC","#6633CC","#6666CC","#6699CC","#66CCCC","#66FFCC","#FFFFFF","#000000","#0000FF","#0033FF","#0066FF","#0099FF","#00CCFF","#00FFFF","#3300FF","#3333FF","#3366FF","#3399FF","#33CCFF","#33FFFF","#6600FF","#6633FF","#6666FF","#6699FF","#66CCFF","#66FFFF","#FF0000","#000000","#990000","#993300","#996600","#999900","#99CC00","#99FF00","#CC0000","#CC3300","#CC6600","#CC9900","#CCCC00","#CCFF00","#FF0000","#FF3300","#FF6600","#FF9900","#FFCC00","#FFFF00","#00FF00","#000000","#990033","#993333","#996633","#999933","#99CC33","#99FF33","#CC0033","#CC3333","#CC6633","#CC9933","#CCCC33","#CCFF33","#FF0033","#FF3333","#FF6633","#FF9933","#FFCC33","#FFFF33","#0000FF","#000000","#990066","#993366","#996666","#999966","#99CC66","#99FF66","#CC0066","#CC3366","#CC6666","#CC9966","#CCCC66","#CCFF66","#FF0066","#FF3366","#FF6666","#FF9966","#FFCC66","#FFFF66","#FFFF00","#000000","#990099","#993399","#996699","#999999","#99CC99","#99FF99","#CC0099","#CC3399","#CC6699","#CC9999","#CCCC99","#CCFF99","#FF0099","#FF3399","#FF6699","#FF9999","#FFCC99","#FFFF99","#00FFFF","#000000","#9900CC","#9933CC","#9966CC","#9999CC","#99CCCC","#99FFCC","#CC00CC","#CC33CC","#CC66CC","#CC99CC","#CCCCCC","#CCFFCC","#FF00CC","#FF33CC","#FF66CC","#FF99CC","#FFCCCC","#FFFFCC","#FF00FF","#000000","#9900FF","#9933FF","#9966FF","#9999FF","#99CCFF","#99FFFF","#CC00FF","#CC33FF","#CC66FF","#CC99FF","#CCCCFF","#CCFFFF","#FF00FF","#FF33FF","#FF66FF","#FF99FF","#FFCCFF","#FFFFFF"];
		$("body").append(('<div id="mlColorPicker"><div id="mlSelectedColorDiv"></div><label for="mlSelectedColorText"></label><input id="mlSelectedColorText" type="text" maxlength="6"><div><a href="javascript://;" id="mlTransparent">transparent</a></div><div id="mlColors"></div></div>'))
		var colorHolder=$("#mlColors");
		$.each(colors, function(i, color){
			colorHolder.append('<div class="mlColor" style="background-color:' + color + '" />')
		});
		$('.mlColor').bind("mouseenter", mouseEnterColor).click(mouseClickColor);
		$("#mlSelectedColorText").keyup(textKeyUp);
		$("#mlTransparent").click(function() {
			$("#mlColorPicker").data("mlOnChange")("transparent");
			close();
		});
		/*$(document).bind('click', function(e){
			$("#mlColorPicker").hide();
		});*/
		$('#mlColorPicker,#mlColorPicker *').click(function(e){e.stopPropagation()});
		$("#mlColorPicker").mouseleave(function() {
			to = window.setTimeout(function() {
				window.clearTimeout(to);
				close();
			}, 2000);
		});
	}
	
	$.fn.mlColorPicker = function(settings) {
		var config = {
			'onChange': function(value){}
		};

		if($("#mlColorPicker").length==0){
			createColorPicker()
		}

		if (settings) $.extend(config, settings);

		this.each(function() {
			$(this).click(function(event){
				$("#mlColorPicker").hide()
						.css("top", event.pageY)
						.css("left", ( (event.pageX + 300 > $(window).width()) ? event.pageX - (event.pageX + 300 - $(window).width()) : event.pageX ))
						.show()
						.data("mlOnChange", config["onChange"]);
			});
		});
		return this;
	};
})(jQuery);
