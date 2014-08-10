function lng2hex(lng) {
	var code = lng.toString(16);
	var codeLength = code.length;
	
	for (var i = codeLength; i < 7; i += 1) {
		code = '0' + code;
	}
	
	return code;
}

function chr2hex(chr) {
	var code = chr.charCodeAt(0).toString(16);
	
	if (code.length == 1) {
		code = '0' + code;
	} else
	if (code.length > 2) {
		code = code[code.length - 2] + code[code.length - 1];
	}
	
	return code;
}

function chr2chr(chr) {
	var code = chr.charCodeAt(0);
	
	if (code >= 33 && code <= 126) {
		return chr;
	} else {
		return '.';
	}
};

function hexdump(data) {
	data = data.toString();
	
	var dataLength = data.length;
	var dump = '';
	
	for (var i = 0; i < dataLength; i += 16) {
		dump += lng2hex(i) + ': ';
		
		for (var j = 0; j < 16; j += 1) {
			if (i + j < data.length) {
				dump += chr2hex(data[i + j]) + ' ';
			} else {
				dump += '   ';
			}
		}
		
		dump += ' ';
		
		for (j = 0; j < 16; j += 1) {
			if (i + j < data.length) {
				dump += chr2chr(data[i + j]);
			}
		}
		
		dump += '\n';
	}
	
	return dump;
}
