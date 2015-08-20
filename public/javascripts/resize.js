$(document).ready(function(){

	function resizeContent(){
		var newHeight = $(window).height();
		var newWidth = $(window).width();
		var navHeight = $('.navbar').height();
		var navWidth = $('.navbar').width();
		$('#totalArea').height(newWidth*0.5+"px");
		$('#totalArea').width(navWidth+"px");
	};

	resizeContent();

	$(window).resize(function(){
		resizeContent();

	});

});