var data;
var grid;

/* ------------------------------------------------------------------------ */

function handleItemSelection(transaction) {
	// pass
}

/* ------------------------------------------------------------------------ */

function getSelectedItem() {
	var selectedIndex = parseInt(grid.getSelectedRows());
	
	if (isNaN(selectedIndex)) {
		return null;
	}
	
	return data.getItem(selectedIndex);
}

/* ------------------------------------------------------------------------ */

function getRowMetaData(row) {
	var item = data.getItem(row);
	var cssClasses = [];
	
	if (item.type) {
		if (item.type.match(/image\//i)) {
			cssClasses.push('image-transaction');
		}
	}
	
	if (item.code >= 100 && item.code <= 199) {
		cssClasses.push('informational-transaction');
	} else
	if (item.code >= 300 && item.code <= 399) {
		cssClasses.push('redirection-transaction');
	} else
	if (item.code >= 400 && item.code <= 499) {
		cssClasses.push('clienterror-transaction');
	} else
	if (item.code >= 500 && item.code <= 599) {
		cssClasses.push('servererror-transaction');
	}
	
	if (cssClasses) {
		return {
			cssClasses: cssClasses.join(' ')
		}
	}
}

/* ------------------------------------------------------------------------ */

function TransactionsDataWindow(size) {
	this.size = size;
	this.items = [];
	this.keys = {};
}

TransactionsDataWindow.prototype = {
	put: function (key, data) {
		key = key.toString();
		
		while (this.items.length >= this.size) {
			var item = this.items.shift();
			
			delete this.keys[item.key];
		}
		
		var newItem = {key: key, data: data};
		
		this.items.push(newItem);
		this.keys[key] = newItem;
	},
	
	get: function (key) {
		key = key.toString();
		
		if (key in this.keys) {
			return this.keys[key].data;
		} else {
			return null;
		}
	},
	
	clr: function () {
		this.items = [];
		this.keys = {};
	}
};

/* ------------------------------------------------------------------------ */

function TransactionsDataView() {
	this.onRowCountChanged = new Slick.Event();
	this.onRowsChanged = new Slick.Event();
	this.onPagingInfoChanged = new Slick.Event();
	this.length = 0;
	this.currentDataWindow = new TransactionsDataWindow(1000);
	this.overalDataWindow = new TransactionsDataWindow(1000);
	this.incompleteConnections = {};
	
	var self = this;
	
	function updateInterval() {
		queryHttpTransactionsState();
	}
	
	this.interval = setInterval(updateInterval, 1000);
	
	function updateRowCount(topic, count) {
		if (self.length == count) {
			return;
		}
		
		var countBefore = self.length;
		var countNow = count;
		
		self.length = countNow;
		
		self.onRowCountChanged.notify({previous: countBefore, current: countNow}, null, self);
	}
	
	observeTopic('http-transactions-state', updateRowCount);
	
	function updateTransaction(topic, transaction) {
		// NOTE: this is a nasty, nasty hack
		if (!transaction.method || !transaction.code) {
			if (transaction.connectionId in self.incompleteConnections) {
				self.incompleteConnections[transaction.connectionId] += 1;
			} else {
				self.incompleteConnections[transaction.connectionId] = 1;
			}
			
			if (self.incompleteConnections[transaction.connectionId] <= 10) {
				setTimeout(function () {
					queryHttpTransactionByRowid(transaction.rowid);
				}, self.incompleteConnections[transaction.connectionId] * 1000);
			}
		}
		//
		
		var rowid = transaction.rowid - 1;
		var dataWindow = self.currentDataWindow;
		var item = dataWindow.get(rowid);
		
		if (!item) {
			dataWindow = self.overalDataWindow;
			item = dataWindow.get(rowid);
		}
		
		if (item) {
			for (var key in transaction) {
				item[key] = transaction[key];
			}
			
			dataWindow.put(rowid, item);
		} else {
			if (rowid >= self.length - self.currentDataWindow.size) {
				self.currentDataWindow.put(rowid, transaction);
			} else {
				self.overalDataWindow.put(rowid, transaction);
			}
		}
		
		self.onRowsChanged.notify({rows: [rowid]}, null, self);
	}
	
	observeTopic('http-transaction', updateTransaction);
}

TransactionsDataView.prototype = {
	queryItem: function (index) {
		var item = this.currentDataWindow.get(index);
		
		if (item) {
			return item;
		}
		
		item = this.overalDataWindow.get(index);
		
		if (item) {
			return item;
		}
		
		return null;
	},
	
	getLength: function () {
		return this.length;
	},
	
	getItem: function (index) {
		var item = this.queryItem(index);
		
		if (item) {
			return item;
		} else {
			item = {};
			
			this.overalDataWindow.put(index, item);
			
			queryHttpTransactionByRowid(index + 1);
			
			return item;
		}
	},
	
	getItemMetadata: function () {
		return {};
	}
}

/* ------------------------------------------------------------------------ */

$(document).ready(function () {
	var columns = [
		{id: 'method', name: 'Method', field: 'method', width: 60},
		{id: 'scheme', name: 'Scheme', field: 'scheme', width: 60},
		{id: 'host', name: 'Host', field: 'host', width: 120},
		{id: 'port', name: 'Port', field: 'port', width: 60},
		{id: 'path', name: 'Path', field: 'path', width: 120},
		{id: 'queries', name: 'Queries', field: 'queries', width: 120},
		{id: 'code', name: 'Code', field: 'code', width: 60},
		{id: 'message', name: 'Mesage', field: 'message', width: 60},
		{id: 'type', name: 'Type', field: 'type', width: 120},
		{id: 'length', name: 'Length', field: 'length', width: 60},
	];
	
	var options = {
		enableCellNavigation: true,
		enableColumnReorder: false,
		forceFitColumns: false,
		rowHeight: 15,
		explicitInitialization: true
	};
	
	data = new TransactionsDataView();
	
	data.onRowCountChanged.subscribe(function (e, args) {
		grid.updateRowCount();
		grid.render();
	});
	
	data.onRowsChanged.subscribe(function (e, args) {
		grid.invalidateRows(args.rows);
		grid.render();
	});
	
	data.getItemMetadata = function (row) {
		return getRowMetaData(row);
	};
	
	grid = new Slick.Grid($('<div/>').attr('id', 'grid').appendTo(document.body).get(0), data, columns, options);
	
	grid.setSelectionModel(new Slick.RowSelectionModel());
	
	grid.onSelectedRowsChanged.subscribe(function () {
		window.handleItemSelection(getSelectedItem());
	});
	
	grid.init();
	
	$(window).resize(function () {
		grid.resizeCanvas();
	});
	
	queryHttpTransactionsState();
});
