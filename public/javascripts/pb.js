$(document).ready(function(){

	$.getJSON("/assets/goddata.json", function(data){
		data.forEach(function(god){
			$('#godsWindow').append('<div class="button godBox" id="'+god.shortname+'"><img src="/images/godicons/' +god.shortname+ '.png"></div>');
		});


		var selectedGod;

		$('.godBox').click(function(){
			selectedGod = $(this).attr('id');
			console.log('Client selected '+selectedGod)
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

		var picks = [];
		var socket = io.connect('http://107.170.246.231:80');			console.log(socket);

		socket.on('serverLock', function (data){
			var currentPhase = picks.length;
			picks.push(data);
			if (currentPhase == 0 || currentPhase == 1 || currentPhase == 2 || currentPhase == 3 || currentPhase == 10 || currentPhase == 11 ){
				$("#pick"+currentPhase).append('<img src="/images/godicons/' +data+ '.png">')
			} else {
				$("#pick"+currentPhase).append('<img src="/images/widegodicons/W' +data+ '.png">')
			}
		});

		socket.on('init', function (data){
			picks = data;
			drawPicks(picks);
		})

		$('#lockButton').click(function(){
			socket.emit('clientLock', selectedGod);
		})

		$('#resetButton').click(function(){
			socket.emit('reset');
		})
	});


function drawPicks(picksArr){
	$('.pickIcon').empty();
	$('.banIcon').empty();
	for(var key in picksArr){

		if (key == 0 || key == 1 || key == 2 || key == 3 || key == 10 || key == 11){
			$("#pick"+key).append('<img src="/images/godicons/' +picksArr[key]+ '.png">');
			console.log(key);
		} else {
			$("#pick"+key).append('<img src="/images/widegodicons/W' +picksArr[key]+ '.png">');
			console.log(key);
		}
		
	}
}

});