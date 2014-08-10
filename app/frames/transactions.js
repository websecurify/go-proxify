$(document).ready(function () {
	if (navigator.userAgent.indexOf("Safari") < 0 || navigator.userAgent.indexOf("Chrome") >= 0) {
		$('frameset frame').attr('frameborder', '0');
	}
});

/* ------------------------------------------------------------------------ */

// $(window).load(function () {
// 	var currentConnectionId = -1;
// 	var transactionsWindow = $('#transactions').get(0).contentWindow;
// 	var clearRequestTimeout = null;
// 	var clearResponseTimeout = null;
// 	
// 	transactionsWindow.handleItemSelection = function () {
// 		clearTimeout(clearRequestTimeout);
// 		clearTimeout(clearResponseTimeout);
// 		
// 		clearRequestTimeout = setTimeout(function () {
// 			requestEditorWindow.getEditor().setValue('');
// 		}, 500);
// 		
// 		clearResponseTimeout = setTimeout(function () {
// 			responseEditorWindow.getEditor().setValue('');
// 		}, 500);
// 		
// 		var item = transactionsWindow.getSelectedItem();
// 		
// 		queryHttpRequestChunksByConnectionId(item.connectionId);
// 		queryHttpResponseChunksByConnectionId(item.connectionId);
// 		
// 		currentConnectionId = item.connectionId;
// 	};
// 	
// 	var controlsWindow = $('#controls').get(0).contentWindow;
// 	var requestEditorWindow = controlsWindow.$('#requestEditor').get(0).contentWindow;
// 	var responseEditorWindow = controlsWindow.$('#responseEditor').get(0).contentWindow;
// 	
// 	observeTopic('http-request-chunks-aggregated', function (topic, connectionId, chunks) {
// 		if (connectionId != currentConnectionId) {
// 			return;
// 		}
// 		
// 		clearTimeout(clearRequestTimeout);
// 		
// 		requestEditorWindow.getEditor().setValue(convertHexChunksToString(chunks));
// 	});
// 	
// 	observeTopic('http-response-chunks-aggregated', function (topic, connectionId, chunks) {
// 		if (connectionId != currentConnectionId) {
// 			return;
// 		}
// 		
// 		clearTimeout(clearResponseTimeout);
// 		
// 		var data = convertHexChunksToString(chunks);
// 		var index = data.indexOf('\r\n\r\n');
// 		
// 		if (index > 0) {
// 			var head = data.substring(0, index);
// 			var body = data.substring(index + 4, data.length);
// 			
// 			if (head.match(/\nContent-Encoding:\s*gzip/mi)) {
// 				body = ungzip(body);
// 			}
// 			
// 			var match = head.match(/\nContent-Type:\s*([^\s]*)/);
// 			
// 			if (match) {
// 				var contentType = match[1].trim();
// 				
// 				if (!contentType.match(/html|javascript|css|xml|json|plain/i)) {
// 					body = hexdump(body);
// 				}
// 			}
// 			
// 			responseEditorWindow.getEditor().setValue(head + '\r\n\r\n' + body);
// 		} else {
// 			responseEditorWindow.getEditor().setValue(data);
// 		}
// 	});
// });
