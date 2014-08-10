$(document).ready(function () {
	$('#request iframe').load(function () {
		this.contentWindow.getEditor().setOption('mode', 'httprequest');
	});
	
	$('#response iframe').load(function () {
		this.contentWindow.getEditor().setOption('mode', 'httpresponse');
	});
	
	$('#tabbar a').click(function () {
		var $this = $(this);
		
		$this.siblings().removeClass('selected');
		$this.addClass('selected');
		
		$($this.attr('href')).css({zIndex: 2}).siblings().css({zIndex: 1});
		
		return false;
	});
});
