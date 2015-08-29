$(document).ready(function(){

	function resizeContent(){
		var contentRatio = 1680/850;
		var windowHeight = $(window).innerHeight();
		var windowWidth = $(window).innerWidth();
		var windowRatio = windowWidth/windowHeight;
		var topMenuHeight = $('#topMenu').height();
	
		if (windowRatio > contentRatio){
			$('#content').height(Math.floor(windowHeight-topMenuHeight)+"px");
			$('#content').width(Math.floor(windowHeight*contentRatio)+"px");
		} else {
			$('#content').width(Math.floor(windowWidth)+"px");
			$('#content').height((Math.floor(windowWidth/contentRatio)-topMenuHeight)+"px") ;
		}
		$('body').css('font-size', $('#content').width()/20+'%');
	};

	

	resizeContent();

	$(window).resize(function(){
		resizeContent();

	});


});