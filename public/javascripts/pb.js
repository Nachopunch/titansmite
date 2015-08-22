$(document).ready(function(){
	console.log('pb.js has loaded');
		$.getJSON("/assets/goddata.json", function(data){
			data.forEach(function(god){
				$('#godsWindow').append('<div class="button godBox" id="'+god.shortname+'"><img src="/images/godicons/' +god.shortname+ '.png"></div>');
			});
		

		$('.godBox').click(function(){
			console.log($(this));

			$('.godBox').removeClass('selected');
			$(this).addClass('selected');
		});

		$('.button').mousedown(function(){
			if ($(this).hasClass('disabled') != true){
				$(this).addClass("buttonPressed");
			}
		});

		$(document).mouseup(function(){
			$('.button').removeClass("buttonPressed");
		});
	});
});

