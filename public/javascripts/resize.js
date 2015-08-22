$(document).ready(function(){

	function resizeContent(){
		var contentRatio = 1480/800;
		var windowHeight = $(window).height();
		var windowWidth = $(window).width();
		var windowRatio = windowWidth/windowHeight;
		var topMenuHeight = $('#topMenu').height();
	
		if (windowRatio > contentRatio){
			$('#content').height(Math.floor(windowHeight-topMenuHeight)+"px");
			$('#content').width(Math.floor(windowHeight*contentRatio)+"px");
		} else {
			$('#content').width(Math.floor(windowWidth)+"px");
			$('#content').height(Math.floor(windowWidth/contentRatio)+"px") ;
		}

	};

	resizeContent();

	$(window).resize(function(){
		resizeContent();

	});

});