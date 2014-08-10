var channelClient = channel.createClient();

/* ------------------------------------------------------------------------ */

function queryHttpRequestChunksByConnectionId(connectionId) {
	channelClient.remotes.trigger('queryHttpRequestChunksByConnectionId', connectionId);
}

function queryHttpResponseChunksByConnectionId(connectionId) {
	channelClient.remotes.trigger('queryHttpResponseChunksByConnectionId', connectionId);
}

/* ------------------------------------------------------------------------ */

function queryHttpRequestSummaryByConnectionId(connectionId) {
	channelClient.remotes.trigger('queryHttpRequestSummaryByConnectionId', connectionId);
}

function queryHttpResponseSummaryByConnectionId(connectionId) {
	channelClient.remotes.trigger('queryHttpResponseSummaryByConnectionId', connectionId);
}

/* ------------------------------------------------------------------------ */

function queryHttpTransactionByConnectionId(connectionId) {
	channelClient.remotes.trigger('queryHttpTransactionByConnectionId', connectionId);
}

function queryHttpTransactionByRowid(rowid) {
	channelClient.remotes.trigger('queryHttpTransactionByRowid', rowid);
}

function queryHttpTransactionsState() {
	channelClient.remotes.trigger('queryHttpTransactionsState');
}

/* ------------------------------------------------------------------------ */

function setProxyPort(port) {
	channelClient.remotes.trigger('setProxyPort', port);
}

function startProxy() {
	channelClient.remotes.trigger('startProxy');
}

function stopProxy() {
	channelClient.remotes.trigger('stopProxy');
}

function hookProxy() {
	channelClient.remotes.trigger('hookProxy');
}

function unhookProxy() {
	channelClient.remotes.trigger('unhookProxy');
}

function queryProxyState() {
	channelClient.remotes.trigger('queryProxyState');
}

/* ------------------------------------------------------------------------ */

function convertHexDataToString(data) {
	var tokens = [];
	var buckets = [];
	
	for (var i = 0; i < data.length; i += 2) {
		tokens.push(parseInt(data.substr(i, 2), 16));
		
		if (tokens.length == 1024) {
			buckets.push(String.fromCharCode.apply(null, tokens));
			
			tokens = [];
		}
	}
	
	buckets.push(String.fromCharCode.apply(null, tokens));
	
	return buckets.join('');
}

function convertHexChunksToString(chunks) {
	return convertHexDataToString(chunks.join(''));
}

/* ------------------------------------------------------------------------ */

(function () {
	var httpRequestChunks = {};
	var httpResponseChunks = {};
	
	/* -------------------------------------------------------------------- */
	
	channelClient.exports.on('handleInitialHttpRequestChunk', function (connectionId, chunk) {
		httpRequestChunks[connectionId] = [];
		
		if (chunk) {
			httpRequestChunks[connectionId].push(chunk);
		}
		
		notifyTopics('initial-http-request-chunk', connectionId, chunk);
	});
	
	channelClient.exports.on('handleHttpRequestChunk', function (connectionId, chunk) {
		if (!chunk) {
			return;
		}
		
		httpRequestChunks[connectionId].push(chunk);
		
		notifyTopics('http-request-chunk', connectionId, chunk);
	});
	
	channelClient.exports.on('handleHttpRequestChunkEnd', function (connectionId) {
		notifyTopics('http-request-chunk-end', connectionId);
		
		if (connectionId in httpRequestChunks) {
			notifyTopics('http-request-chunks-aggregated', connectionId, httpRequestChunks[connectionId]);
			
			delete httpRequestChunks[connectionId];
		}
	});
	
	/* -------------------------------------------------------------------- */
	
	channelClient.exports.on('handleInitialHttpResponseChunk', function (connectionId, chunk) {
		httpResponseChunks[connectionId] = [];
		
		if (chunk) {
			httpResponseChunks[connectionId].push(chunk);
		}
		
		notifyTopics('initial-http-response-chunk', connectionId, chunk);
	});
	
	channelClient.exports.on('handleHttpResponseChunk', function (connectionId, chunk) {
		if (!chunk) {
			return;
		}
		
		httpResponseChunks[connectionId].push(chunk);
		
		notifyTopics('http-response-chunk', connectionId, chunk);
	});
	
	channelClient.exports.on('handleHttpResponseChunkEnd', function (connectionId) {
		notifyTopics('http-response-chunk-end', connectionId);
		
		if (connectionId in httpResponseChunks) {
			notifyTopics('http-response-chunks-aggregated', connectionId, httpResponseChunks[connectionId]);
			
			delete httpResponseChunks[connectionId];
		}
	});
	
	/* -------------------------------------------------------------------- */
	
	channelClient.exports.on('handleHttpRequestSummary', function (summary) {
		notifyTopics('http-request-summary', summary);
	});
	
	channelClient.exports.on('handleHttpResponseSummary', function (summary) {
		notifyTopics('http-response-summary', summary);
	});
	
	/* -------------------------------------------------------------------- */
	
	channelClient.exports.on('handleHttpTransaction', function (transaction) {
		notifyTopics('http-transaction', transaction);
	});
	
	channelClient.exports.on('handleHttpTransactionsState', function (count) {
		notifyTopics('http-transactions-state', count);
	});
	
	/* -------------------------------------------------------------------- */
	
	channelClient.exports.on('handleProxyState', function (isRunning, isIntercepting, port, message) {
		notifyTopics('proxy-state', isRunning, isIntercepting, port, message);
	});
})();
