$(document).ready(function () {
	$('#sidebar a:not([href^="#toggle-"])').click(function () {
		var $this = $(this);
		
		$this.parent().siblings().children('a').removeClass('selected');
		$this.addClass('selected');
		
		$($this.attr('href')).css({zIndex: 2}).siblings().css({zIndex: 1});
		
		return false;
	});
	
	$('a[href="#toggle-running"]').click(function () {
		var $this = $(this);
		
		if ($this.children('div').is('.icon-play')) {
			startProxy();
		} else {
			stopProxy();
		}
		
		return false;
	});
});
