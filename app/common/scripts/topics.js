(function (window) {
	var topicObservers = {};
	
	/* -------------------------------------------------------------------- */
	
	window.observeTopic = function (topic, observer) {
		if (!(topic in topicObservers)) {
			topicObservers[topic] = [];
		}
		
		topicObservers[topic].push(observer);
	}
	
	window.notifyTopics = function (topic) {
		if (!(topic in topicObservers)) {
			return;
		}
		
		var args = [topic].concat(Array.prototype.slice.call(arguments).splice(1));
		
		topicObservers[topic].forEach(function (observer) {
			observer.apply(null, args);
		});
	};
})(window);
