var editor;
var editorId;

/* ------------------------------------------------------------------------ */

function getEditor() {
	return editor;
}

/* ------------------------------------------------------------------------ */

function getWindowHeight() {
	return window.innerHeight || (document.documentElement || document.body).clientHeight;
}

/* ------------------------------------------------------------------------ */

function HttpRequestTokenizer(config) {
	this.javascriptMode = CodeMirror.getMode(config, 'javascript');
	this.cssMode = CodeMirror.getMode(config, 'css');
	this.xmlMode = CodeMirror.getMode(config, 'xml');
	this.htmlMode = CodeMirror.getMode(config, 'htmlmixed');
	this.jsonMode = CodeMirror.getMode(config, 'javascript');
}

HttpRequestTokenizer.prototype = {
	matchToEnd: function (stream, state) {
		stream.skipToEnd();
	},
	
	matchBody: function (stream, state) {
		if (!('submode' in state)) {
			if ('contentType' in state) {
				var contentType = state.contentType;
				
				if (contentType.match(/\W(javascript|jscript)(;|$)/i)) {
					state.substate = this.javascriptMode.startState();
					state.submode = 'javascriptMode';
				} else
				if (contentType.match(/\Wcss(;|$)/i)) {
					state.substate = this.cssMode.startState();
					state.submode = 'cssMode';
				} else
				if (contentType.match(/\Wxml(;|$)/i)) {
					state.substate = this.xmlMode.startState();
					state.submode = 'xmlMode';
				} else
				if (contentType.match(/\Whtml(;|$)/i)) {
					state.substate = this.htmlMode.startState();
					state.submode = 'htmlMode';
				} else
				if (contentType.match(/\Wjson(;|$)/i)) {
					state.substate = this.jsonMode.startState();
					state.submode = 'jsonMode';
				} else {
					stream.skipToEnd();
					
					return;
				}
			} else {
				stream.skipToEnd();
				
				return;
			}
		}
		
		return this[state.submode].token(stream, state.substate);
	},
	
	/*
	message-header = field-name ":" [ field-value ]
	field-name     = token
	field-value    = *( field-content | LWS )
	field-content  = <the OCTETs making up the field-value
	                 and consisting of either *TEXT or combinations
	                 of token, separators, and quoted-string>
	
	token          = 1*<any CHAR except CTLs or separators>
	
	CHAR           = <any US-ASCII character (octets 0 - 127)>
	
	CTL            = <any US-ASCII control character
	                 (octets 0 - 31) and DEL (127)>
	
	separators     = "(" | ")" | "<" | ">" | "@"
	               | "," | ";" | ":" | "\" | <">
	               | "/" | "[" | "]" | "?" | "="
	               | "{" | "}" | SP | HT
	*/
	
	matchHeaderValue: function (stream, state) {
		if (stream.sol()) { // shouldn't start at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			state.matcher = 'matchHeaderName';
			
			stream.skipToEnd(); // this may result into an empty header, which we allow
			
			var niceHeaderName = state.headerName.toLowerCase();
			
			if (niceHeaderName == 'content-length:') {
				var contentLength = stream.current();
				var hasErrors = false;
				
				try {
					contentLength = parseInt(contentLength, 10);
					
					if (isNaN(contentLength)) {
						throw new Error('cannot parse number');
					}
				} catch (e) {
					hasErrors = true;
				}
				
				if (hasErrors) {
					return 'error';
				} else {
					return 'number';
				}
			} else
			if (niceHeaderName == 'content-type:') {
				state.contentType = stream.current();
				
				return 'comment';
			} else {
				return 'string';
			}
		}
	},
	
	matchHeaderName: function (stream, state) {
		if (!stream.sol()) { // starts at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			var match = stream.match(/^[^()<>@,;:\\"\/\[\]?={}\s]+:/);
			
			if (match) {
				state.headerName = match.toString();
				
				state.matcher = 'matchHeaderValue';
				
				return 'atom';
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	matchVersion: function (stream, state) {
		if (stream.sol()) { // shouldn't start at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			if (stream.match(/^HTTP\/\d\.\d/)) {
				if (!stream.eol()) { // next must be end of line
					state.matcher = 'matchToEnd';
					
					stream.skipToEnd();
					
					return 'error';
				} else {
					state.matcher = 'matchHeaderName';
					
					return 'keyword';
				}
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	matchUrl: function (stream, state) {
		if (stream.sol()) { // shouldn't start at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			if (stream.match(/^[^\s]+/)) {
				if (stream.next() != ' ') { // next must be space
					state.matcher = 'matchToEnd';
					
					stream.skipToEnd();
					
					return 'error';
				} else {
					state.matcher = 'matchVersion';
					
					return 'string';
				}
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	matchMethod: function (stream, state) {
		if (!stream.sol()) { // starts at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			if (stream.match(/^\w+/)) {
				if (stream.next() != ' ') { // next must be space
					state.matcher = 'matchToEnd';
					
					stream.skipToEnd();
					
					return 'error';
				} else {
					state.matcher = 'matchUrl';
					
					return 'keyword';
				}
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	startState: function () {
		return {matcher: 'matchMethod'};
	},
	
	copyState: function (state) {
		var newState = {matcher: state.matcher};
		
		if ('contentType' in state) {
			newState.contentType = state.contentType;
		}
		
		if ('headerName' in state) {
			newState.headerName = state.headerName;
		}
		
		if ('submode' in state) {
			newState.submode = state.submode;
			newState.substate = CodeMirror.copyState(this[newState.submode], state.substate);
		}
		
		return newState;
	},
	
	indent: function (state, textAfter) {
		if ('submode' in state) {
			this[state.submode].indent(state.substate, textAfter);
			
			return 0;
		} else {
			return 0;
		}
	},
	
	blankLine: function (state) {
		delete state.headerName; // cleanup the header name here because it is not needed anymore
		
		state.matcher = 'matchBody';
	},
	
	token: function(stream, state) {
		return this[state.matcher](stream, state);
	}
};

CodeMirror.defineMode('httprequest', function(config) {
	return new HttpRequestTokenizer(config);
});

CodeMirror.defineMIME('text/x-httprequest', 'httprequest');

/* ------------------------------------------------------------------------ */

function HttpResponseTokenizer(config) {
	this.javascriptMode = CodeMirror.getMode(config, 'javascript');
	this.cssMode = CodeMirror.getMode(config, 'css');
	this.xmlMode = CodeMirror.getMode(config, 'xml');
	this.htmlMode = CodeMirror.getMode(config, 'htmlmixed');
	this.jsonMode = CodeMirror.getMode(config, 'javascript');
}

HttpResponseTokenizer.prototype = {
	matchToEnd: function (stream, state) {
		stream.skipToEnd();
	},
	
	matchBody: function (stream, state) {
		if (!('submode' in state)) {
			if ('contentType' in state) {
				var contentType = state.contentType;
				
				if (contentType.match(/\W(javascript|jscript)(;|$)/i)) {
					state.substate = this.javascriptMode.startState();
					state.submode = 'javascriptMode';
				} else
				if (contentType.match(/\Wcss(;|$)/i)) {
					state.substate = this.cssMode.startState();
					state.submode = 'cssMode';
				} else
				if (contentType.match(/\Wxml(;|$)/i)) {
					state.substate = this.xmlMode.startState();
					state.submode = 'xmlMode';
				} else
				if (contentType.match(/\Whtml(;|$)/i)) {
					state.substate = this.htmlMode.startState();
					state.submode = 'htmlMode';
				} else
				if (contentType.match(/\Wjson(;|$)/i)) {
					state.substate = this.jsonMode.startState();
					state.submode = 'jsonMode';
				} else {
					stream.skipToEnd();
					
					return;
				}
			} else {
				stream.skipToEnd();
				
				return;
			}
		}
		
		return this[state.submode].token(stream, state.substate);
	},
	
	/*
	message-header = field-name ":" [ field-value ]
	field-name     = token
	field-value    = *( field-content | LWS )
	field-content  = <the OCTETs making up the field-value
	                 and consisting of either *TEXT or combinations
	                 of token, separators, and quoted-string>
	
	token          = 1*<any CHAR except CTLs or separators>
	
	CHAR           = <any US-ASCII character (octets 0 - 127)>
	
	CTL            = <any US-ASCII control character
	                 (octets 0 - 31) and DEL (127)>
	
	separators     = "(" | ")" | "<" | ">" | "@"
	               | "," | ";" | ":" | "\" | <">
	               | "/" | "[" | "]" | "?" | "="
	               | "{" | "}" | SP | HT
	*/
	
	matchHeaderValue: function (stream, state) {
		if (stream.sol()) { // shouldn't start at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			state.matcher = 'matchHeaderName';
			
			stream.skipToEnd(); // this may result into an empty header, which we allow
			
			var niceHeaderName = state.headerName.toLowerCase();
			
			if (niceHeaderName == 'content-length:') {
				var contentLength = stream.current();
				var hasErrors = false;
				
				try {
					contentLength = parseInt(contentLength, 10);
					
					if (isNaN(contentLength)) {
						throw new Error('cannot parse number');
					}
				} catch (e) {
					hasErrors = true;
				}
				
				if (hasErrors) {
					return 'error';
				} else {
					return 'number';
				}
			} else
			if (niceHeaderName == 'content-type:') {
				state.contentType = stream.current();
				
				return 'comment';
			} else {
				return 'string';
			}
		}
	},
	
	matchHeaderName: function (stream, state) {
		if (!stream.sol()) { // starts at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			var match = stream.match(/^[^()<>@,;:\\"\/\[\]?={}\s]+:/);
			
			if (match) {
				state.headerName = match.toString();
				
				state.matcher = 'matchHeaderValue';
				
				return 'atom';
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	matchMessage: function (stream, state) {
		if (stream.sol()) { // shouldn't start at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			if (stream.match(/^.+/)) {
				if (!stream.eol()) { // next must be end of line
					state.matcher = 'matchToEnd';
					
					stream.skipToEnd();
					
					return 'error';
				} else {
					state.matcher = 'matchHeaderName';
					
					return 'keyword';
				}
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	matchCode: function (stream, state) {
		if (stream.sol()) { // shouldn't start at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			if (stream.match(/^[\d]+/)) {
				if (stream.next() != ' ') { // next must be space
					state.matcher = 'matchToEnd';
					
					stream.skipToEnd();
					
					return 'error';
				} else {
					state.matcher = 'matchMessage';
					
					return 'number';
				}
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	matchVersion: function (stream, state) {
		if (!stream.sol()) { // starts at the begining of line
			state.matcher = 'matchToEnd';
			
			stream.skipToEnd();
			
			return 'error';
		} else {
			if (stream.match(/^HTTP\/\d\.\d/)) {
				if (stream.next() != ' ') { // next must be space
					state.matcher = 'matchToEnd';
					
					stream.skipToEnd();
					
					return 'error';
				} else {
					state.matcher = 'matchCode';
					
					return 'keyword';
				}
			} else {
				state.matcher = 'matchToEnd';
				
				stream.skipToEnd();
				
				return 'error';
			}
		}
	},
	
	startState: function () {
		return {matcher: 'matchVersion'};
	},
	
	copyState: function (state) {
		var newState = {matcher: state.matcher};
		
		if ('contentType' in state) {
			newState.contentType = state.contentType;
		}
		
		if ('headerName' in state) {
			newState.headerName = state.headerName;
		}
		
		if ('submode' in state) {
			newState.submode = state.submode;
			newState.substate = CodeMirror.copyState(this[newState.submode], state.substate);
		}
		
		return newState;
	},
	
	indent: function (state, textAfter) {
		if ('submode' in state) {
			this[state.submode].indent(state.substate, textAfter);
			
			return 0;
		} else {
			return 0;
		}
	},
	
	blankLine: function (state) {
		delete state.headerName; // cleanup the header name here because it is not needed anymore
		
		state.matcher = 'matchBody';
	},
	
	token: function(stream, state) {
		return this[state.matcher](stream, state);
	}
};

CodeMirror.defineMode('httpresponse', function(config) {
	return new HttpResponseTokenizer(config);
});

CodeMirror.defineMIME('text/x-httpresponse', 'httpresponse');

/* ------------------------------------------------------------------------ */

$(document).ready(function () {
	var options = {
		lineWrapping: true,
		readOnly: true
	};
	
	editor = CodeMirror($('<div></div>').appendTo(document.body).get(0), options);
	
	var wrap = editor.getWrapperElement();
	
	wrap.style.height = getWindowHeight() + 'px';
	
	$(wrap).addClass('CodeMirror-fullscreen');
	
	editor.refresh();
	
	CodeMirror.on(window, 'resize', function() {
		wrap.style.height = getWindowHeight() + 'px';
    });
});
