/*
	@filename: js.js

	Copyright (C) 2007-2013 mustafa
	This program is free software; you can redistribute it and/or modify it under the terms of the
	GNU General Public License as published by the Free Software Foundation.
*/

function $(element) {
	return document.getElementById(element);
}
var popup, fOp, edit, upload, shell, __AJAX_ACTIVE,
	__CODEMIRROR, __CODEMIRROR_MODE, __CODEMIRROR_LOADED, __CODEMIRROR_PATH = "_cm",
	__CODEMIRROR_MODES = {
		"html": "htmlmixed",
		"js": "javascript",
		"py": "python",
		"rb": "ruby",
		"md": "markdown"
		//TODO: complete list
	};

function ajax(url, method, data, handler, upload, uploadProgressHandler) {
	__AJAX_ACTIVE = true;
	if (!upload) {
		json2markup([
		"div",
		{
			attributes : {
				"id" : "ajaxOverlay"
			}
		},
		"img",
		{
			attributes : {
				"src" : "pafm-files/images/ajax.gif",
				"id" : "ajaxImg",
				"title" : "Loading",
				"alt" : "Loading"
			}
		}], document.body);
		$("ajaxOverlay").style.height = document.body.offsetHeight + "px";
		fade($("ajaxOverlay"), 0, 6, 25, "in");
	}
	var xhr = window.ActiveXObject ? new ActiveXObject("MSXML2.XMLHTTP.3.0") : new XMLHttpRequest();
	uploadProgressHandler && xhr.upload.addEventListener("progress", uploadProgressHandler, false);
	xhr.open(method, url, true);
	xhr.onreadystatechange = function(){
		if (xhr.readyState != 4)
			return;
		__AJAX_ACTIVE = false;
		upload || fade($("ajaxOverlay"), 6, 0, 25, "out", function(){
			document.body.removeChild($("ajaxOverlay"));
			document.body.removeChild($("ajaxImg"));
		});
		if (xhr.status == 200 || xhr.statusText == "OK") {
			if (xhr.responseText == "Please refresh the page and login")
				alert(xhr.responseText);
			else
				handler(xhr.responseText);
		}
		else
			alert("AJAX request unsuccessful."
			+ "\nStatus Code: " + xhr.status
			+ "\nStatus Text: " + xhr.statusText
			+ "\nParameters: " + url);
		xhr = null;
	};
	if (method.toLowerCase() == "post" && !upload)
		xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
	xhr.send(data);
}

/*
 * Structure:
 *
 * [
 * 	"element",
 *	{
 *		attributes:{},
 *		events:{},
 *		style: {},
 *		text: ""
 *	}
 *	[
 *		"childElement",
 *		{
 *			...
 *		}
 *		[
 *			...
 *		]
 *	],
 *	"..."
 * ]
 *
 */
function json2markup(json, path) {
	var i = 0, l = json.length, el, attrib, event;
	for ( ; i < l; i++) {
		if (json[i].constructor == Array)
			json2markup(json[i], el);
		else if (json[i].constructor == Object){
			if (json[i].attributes)
				for (attrib in json[i].attributes)
					switch (attrib.toLowerCase()){
						case "class":
							el.className = json[i].attributes[attrib];
							break;
						case "style":
							el.style.cssText = json[i].attributes[attrib];
							break;
						case "for":
							el.htmlFor = json[i].attributes[attrib];
							break;
						default:
							el.setAttribute(attrib, json[i].attributes[attrib]);
					}
			if (json[i].events)
				for (event in json[i].events)
					el.addEventListener(event, json[i].events[event], false);
			if (json[i].preText)
				path.appendChild(document.createTextNode(json[i].preText));
			if (json[i].text)
				el.appendChild(document.createTextNode(json[i].text));
			switch (json[i].insert){
				case "before":
					path.parentNode.insertBefore(el, path);
					break;
				case "after":
					path.parentNode.insertBefore(el, path.nextSibling);
					break;
				case "under":
				default:
					path.appendChild(el);
			}
			if (json[i].postText)
				path.appendChild(document.createTextNode(json[i].postText));
		}
		else
			el = document.createElement(json[i]);
	}
}
function fade(element, fadeFrom, fadeTo, speed, type, callback) {
	var which = element.style.opacity != undefined, condition, interval;
	element.style[which ? "opacity" : "filter"] = which ? fadeFrom / 10 : "alpha(opacity="+ fadeFrom * 10 +")";
	interval = setInterval(function(){
		if (type == "in") {
			fadeFrom++;
			condition = fadeFrom <= fadeTo;
		}
		else if (type == "out"){
			fadeFrom--;
			condition = fadeFrom >= fadeTo;
		}
		if (condition)
			element.style[which ? "opacity" : "filter"] = which ? fadeFrom / 10 : "alpha(opacity="+ fadeFrom * 10 +")";
		else {
			clearInterval(interval);
			if (callback)
				callback();
		}
	}, speed);
}
popup = {
	init : function(title, content) {
		json2markup([
		"div",
		{
			attributes : {
				"id" : "popOverlay"
			},
			events : {
				"click" : popup.close
			}
		}], document.body);
		json2markup([
			"div",
			{
				attributes : {
					"id" : "popup"
				}
			},
			[
				"div",
				{
					attributes : {
						"id" : "head"
					}
				},
				[
					"a",
					{
						attributes : {
							"id" : "x",
							"href" : "#"
						},
						events : {
							click : function(e){
								popup.close();
								e.preventDefault ? e.preventDefault() : e.returnValue = false;
							}
						},
						text : "[x]"
					},
					"span",
					{
						text : title
					}
				],
				"div",
				{
					attributes : {
						"id" : "body"
					}
				}
			]
		], document.body);
		var popupEl = $("popup"), popOverlayEl = $("popOverlay"), mlEl;
		json2markup(content, $("body"));
		if (mlEl = $('moveListUL')) {
			if (mlEl.offsetHeight > (document.body.offsetHeight - 150))
				mlEl.style.height = document.body.offsetHeight - 150 + "px";
		}
		popupEl.style.marginTop = "-" + parseInt(popupEl.offsetHeight) / 2 + "px";
		popupEl.style.marginLeft = "-" + parseInt(popupEl.offsetWidth) / 2 + "px";
		fade(popOverlayEl, 0, 6, 25, "in");
		document.onkeydown = function(e) {
			if ((e || window.event).keyCode == 27) {
				popup.close();
				return false;
			}
		};
	},
	close : function() {
		if (__AJAX_ACTIVE)
			return;
		if ($("popup")){
			var popOverlayEl = $("popOverlay");
			fade(popOverlayEl, 6, 0, 25, "out", function(){
				document.body.removeChild(popOverlayEl);
			});
			document.body.removeChild($("popup"));
		}
		document.onkeydown = null;
	}
};
fOp = {
	rename : function(subject, path) {
		popup.init("Rename:", [
			"form",
			{
				attributes : {
					"action" : "?do=rename&subject=" + subject + "&path=" + path + "&nonce=" + nonce,
					"method" : "post"
				}
			},
			[
				"input",
				{
					attributes : {
						"title" : "Rename To",
						"type" : "text",
						"name" : "rename",
						"value" : subject
					}
				},
				"input",
				{
					attributes : {
						"title" : "Ok",
						"type" : "submit",
						"value" : "\u2713"
					}
				}
			]
		]);
	},
	create : function(type, path) {
		popup.init("Create " + type + ":", [
			"form",
			{
				attributes : {
					"method" : "post",
					"action" : "?do=create&path=" + path + "&f_type=" + type + "&nonce=" + nonce
				}
			},
			[
				"input",
				{
					attributes : {
						"title" : "Filename",
						"type" : "text",
						"name" : "f_name"
					}
				},
				"input",
				{
					attributes : {
						"title" : "Ok",
						"type" : "submit",
						"value" : "\u2713"
					}
				}
			]
		]);
	},
	chmod : function(path, subject, chmod){
		popup.init("Chmod " + unescape(subject) + ":", [
			"form",
			{
				attributes : {
					"method" : "post",
					"action" : "?do=chmod&subject=" + subject + "&path=" + path + "&nonce=" + nonce
				}
			},
			[
				"input",
				{
					attributes : {
						"title" : "chmod",
						"type" : "text",
						"name" : "mod",
						"value" : chmod
					}
				},
				"input",
				{
					attributes : {
						"title" : "Ok",
						"type" : "submit",
						"value" : "\u2713"
					}
				}
			]
		]);
	},
	copy : function(subject, path){
		popup.init("Copy " + unescape(subject) + ":", [
			"form",
			{
				attributes : {
					"method" : "post",
					"action" : "?do=copy&subject=" + subject + "&path=" + path + "&nonce=" + nonce
				}
			},
			[
				"input",
				{
					attributes : {
						"title" : "copy to",
						"type" : "text",
						"name" : "to",
						"value" : "copy-" + subject
					}
				},
				"input",
				{
					attributes : {
						"title" : "Ok",
						"type" : "submit",
						"value" : "\u2713"
					}
				}
			]
		]);
	},
	moveList : function(subject, path, to){
		ajax(("?do=moveList&subject=" + subject + "&path=" + path + "&to=" + to), "get", null, function (response) {
			if (!$("popup"))
				popup.init("Move " + unescape(subject) + " to:", Function("return " + response)());
			else {
				var popupEl = $("popup"), mlEl;
				$("body").innerHTML = "";
				json2markup(Function("return " + response)(), $("body"));
				if ((mlEl = $('moveListUL')).offsetHeight > (document.body.offsetHeight - 150))
					mlEl.style.height = document.body.offsetHeight - 150 + "px";
				popupEl.style.marginTop = "-" + parseInt(popupEl.offsetHeight) / 2 + "px";
				popupEl.style.marginLeft = "-" + parseInt(popupEl.offsetWidth) / 2 + "px";
			}
		});
	},
	remoteCopy : function(path){
		popup.init("Remote Copy:", [
			"form",
			{
				attributes : {
					"method" : "post",
					"action" : "?do=remoteCopy&path=" + path + "&nonce=" + nonce,
					"id": "remote-copy"
				}
			},
			[
				"legend",
				{text: "Location: "},
				[
					"br", {},
					"input",
					{
						attributes: {
							"title": "Remote Copy",
							"type": "text",
							"name": "location"
						},
						events: {
							change: function(e){
								$('remoteCopyName').value = this.value.substring(this.value.lastIndexOf('/') + 1);
							}
						}
					}
				],
				"legend",
				{text: "Name: "},
				[
					"br", {},
					"input",
					{
						attributes: {
							"id": "remoteCopyName",
							"title": "Name",
							"type": "text",
							"name": "to"
						}
					}
				],
				"input",
				{
					attributes: {
						"title": "Ok",
						"type": "submit",
						"value": "\u2713"
					}
				}
			]
		]);
	}
};
edit = {
	init : function(subject, path, mode, codeMirrorInstalled) {
		__CODEMIRROR_MODE = mode;
		json2markup([
			"div",
			{
				attributes: {"id": "editOverlay"}
			}
		], document.body)
		$("editOverlay").style.height = "100%";
		json2markup([
		"div",
		{
			attributes : {"id": "ea"}
		},
		[
			"textarea",
			{
				attributes: {
					"id": "ta",
					"rows": "30",
					"cols": "90"
				},
				events: {
					change: function(){
						window.__FILECHANGED = true;
					}
				}
			},
			"br",
			{},
			"input",
			{
				attributes: {
					"type": "text",
					"value": unescape(subject),
					"readonly": ""
				}
			},
			"input",
			{
				attributes : {
					"type" : "button",
					"value" : "CodeMirror"
				},
				events : {
					click : function(){
						if (codeMirrorInstalled)
							edit.codeMirrorLoad();
						else if (confirm("Install CodeMirror?"))
							ajax("?do=installCodeMirror", "get", null, function(response){
								if (response == "")
									edit.codeMirrorLoad();
								else
									alert("Install failed. Manually upload CodeMirror"
									+ "and place it in _codemirror, in the same directory as pafm");
							});
						this.disabled = true;
					}
				}
			},
			"input",
			{
				attributes : {
					"type" : "button",
					"value" : "Save",
					"id" : "save"
				},
				events : {
					click : function(){
						edit.save(subject, path);
					}
				}
			},
			"input",
			{
				attributes : {
					"type" : "button",
					"value" : "Exit",
					"id" : "exit"
				},
				events : {
					click : function(){
						edit.exit(subject, path);
					}
				}
			},
			"span",
			{
				attributes : {
					"id" : "editMsg"
				}
			}
		]], document.body);
		document.onkeydown = function(e){
			if ((e || window.event).keyCode == 27) {
				edit.exit(subject, path);
				return false;
			}
		};
		ajax("?do=readFile&path=" + path + "&subject=" + subject, "get", null, function(response){
			$("ta").value = response;
		});
		location = "#header";
	},
	codeMirrorLoad: function(){
		if(!__CODEMIRROR_LOADED)
			json2markup([
				"script",
				{
					attributes: {
						"src":  __CODEMIRROR_PATH + "/cm.js",
						"type": "text/javascript"
					},
					events: {
						load: function(){
							__CODEMIRROR_LOADED = true;
							edit.codeMirrorLoad();
						}
					}
				},
				"link",
				{
					attributes: {
						"rel": "stylesheet",
						"href": __CODEMIRROR_PATH + "/cm.css"
					}
				},
			], document.getElementsByTagName("head")[0]);
		else {
			var modeName = __CODEMIRROR_MODES[__CODEMIRROR_MODE] || __CODEMIRROR_MODE;

			__CODEMIRROR = CodeMirror.fromTextArea($("ta"), {
				onChange: function(){
					window.__FILECHANGED = true;
				},
				lineNumbers: true
			});

			__CODEMIRROR.setOption("mode", modeName);
		}

	},
	save : function(subject, path){
		__CODEMIRROR && __CODEMIRROR.save();
		$("editMsg").innerHTML = null;
		var postData = "data=" + encodeURIComponent($("ta").value);
		ajax("?do=saveEdit&subject=" + subject + "&path=" + path + "&nonce=" + nonce, "post", postData, function(response){
			$("editMsg").className = response.indexOf("saved") == -1 ? "failed" : "succeeded"
			$("editMsg").innerHTML = response;
		});
		window.__FILESAVED = true;
		window.__FILECHANGED = false;
	},
	exit : function(subject, path){
		if (window.__FILECHANGED && !confirm("Leave without saving?"))
			return;
		if (window.__FILESAVED) {
			ajax("?do=getfs&path=" + path + "&subject=" + subject, "get", null, function(response){
				var listItems = $("dirList").getElementsByTagName("li"), temp = unescape(subject), i = 0, l = listItems.length;
				for ( ; i < l; i++) {
					if (listItems[i].title == temp) {
						listItems[i].getElementsByTagName("span")[0].innerHTML = response;
						break;
					}
				}
			});
		}
		__CODEMIRROR = null;
		document.body.removeChild($("ea"));
		document.body.removeChild($("editOverlay"));
		window.__FILESAVED = null;
		document.onkeydown = null;
	}
};
/**
 * TODO: multiline commands
 */
shell = {
	init: function(whoami, cwd) {
		popup.init("Shell:", [
			"textarea",
			{
				attributes: {"id" : "shell-history"},
				text : ""
			},
			"form",
			{
				attributes: {
					"id" : "shell",
					"action" : "?do=shell&nonce=" + nonce,
					"method" : "post"
				},
				events: {"submit": shell.submit}
			},
			[
				"input",
				{
					attributes: {
						"type": "text",
						"name": "cmd",
						"id": "cmd",
						"data-bash": "[" + whoami + " " + cwd + "]"
					}
				},
				"input",
				{
					attributes : {
						"title" : "Ok",
						"type" : "submit",
						"value" : "\u2713"
					}
				}
			]
		]);
	},
	submit : function(e){
		e.preventDefault();
		$("shell-history").innerHTML += $("cmd").getAttribute("data-bash") + "> " + $("cmd").value;
		ajax($("shell").getAttribute("action"), "POST", "cmd=" + encodeURIComponent($("cmd").value),
			function (response) {
				$("shell-history").innerHTML += "\n" + response;
				$("shell-history").scrollTop = $("shell-history").scrollHeight
			}
		);
		$("cmd").value = '';
		return false;
	}
};
upload = {
	init : function(path, fsize) {
		popup.init("Upload:", [
			"form",
			{
				attributes: {
					"id": "upload",
					"action": "?do=upload&path=" + path,
					"method": "post",
					"enctype": "multipart/form-data",
					"encoding": "multipart/form-data"
				}
			},
			[
				"input",
				{
					attributes: {
						"type": "hidden",
						"name": "MAX_FILE_SIZE",
						"value":  fsize
					}
				},
				"input",
				{
					attributes: {
						"type": "file",
						"id": "file_input",
						"name": "file"
					},
					events: {
						change: function(e) {
							upload.chk(e.target.files[0].name, path);
						}
					}
				}
			],
			"div",
			{
				attributes: {"id": "upload-drag"},
				events: {
					dragover: function(e) {
						this.className = "upload-dragover";
						e.preventDefault();
					},
					dragleave: function() {
						this.className = "";
					},
					drop: function(e) {
						e.preventDefault();
						upload.chk(e.dataTransfer.files[0].name, path, e.dataTransfer.files[0]);
					},
				},
				text: "drag here"
			},
			"div",
			{
				attributes: {
					"id": "response"
				},
				text: "php.ini upload limit: " + Math.floor(fsize/1048576) + " MB"
			}
		]);
	},
	chk : function(subject, path, dndFile) {
		var uploadData = new FormData();
		uploadData.append("file", dndFile || $("file_input").files[0]);

		ajax("?do=fileExists&path="+path+"&subject=" + subject, "GET", null, function(response){
			if (response == "1"){
				json2markup([
					"input",
					{
						insert : "after",
						attributes : {
							"type" : "button",
							"value" : "Replace?"
						},
						events : {
							click : function(e){
								upload.submit(path, uploadData);
							}
						}
					}
				], $("file_input"));
			}
			else
				upload.submit(path, uploadData);
		});
	},
	submit: function(path, uploadData){
		ajax("?do=upload&path=" + path + "&nonce=" + nonce, "POST", uploadData,
			function (response) {
				$("response").innerHTML = response;
				location.reload(true); //TODO: auto-update file list
			},
			true,
			function (e){
				if (e.lengthComputable) {
					var percentage = Math.round((e.loaded * 100) / e.total);
					$("response").innerHTML = "uploaded: " + percentage + "%";
				}
			}
		);
	}
};
