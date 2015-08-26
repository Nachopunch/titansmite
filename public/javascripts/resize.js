$(document).ready(function(){

	function resizeContent(){
		var contentRatio = 1680/800;
		var windowHeight = $(window).innerHeight();
		var windowWidth = $(window).innerWidth();
		var windowRatio = windowWidth/windowHeight;
		var topMenuHeight = $('#topMenu').height();
	
		if (windowRatio > contentRatio){
			$('body').height(Math.floor(windowHeight-topMenuHeight)+"px");
			$('body').width(Math.floor(windowHeight*contentRatio)+"px");
		} else {
			$('body').width(Math.floor(windowWidth)+"px");
			$('body').height(Math.floor(windowWidth/contentRatio)+"px") ;
		}

	};

	

	resizeContent();

	$(window).resize(function(){
		resizeContent();

	});

});