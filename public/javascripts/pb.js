$(document).ready(function(){

	//load god data json file~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	$.getJSON("/assets/goddata.json", function(godData){
		godData.forEach(function(god){
			$('#godsWindow').append('<div class="button godBox" id="'+god.shortname+'"><img src="/images/godicons/' +god.shortname+ '.png"></div>');
		});

		var selectedGod;

		// god box click handler~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('.godBox').click(function(){
			selectedGod = $(this).attr('id');
			console.log('(client) selected '+selectedGod)
			$('.godBox').removeClass('selected');
			$(this).addClass('selected');
		});

		// button click effects~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
		$('.button').mousedown(function(){
			if ($(this).hasClass('disabled') != true){
				$(this).addClass("buttonPressed");
			}
		});

		$(document).mouseup(function(){
			$('.button').removeClass("buttonPressed");
		});

		var picks = [];
		var phase = picks.length;
		var socket = io.connect('http://localhost:80');			console.log(socket);

		socket.on('serverLock', function (data){
			
			picks.push(data);
			if (phase == 0 || phase == 1 || phase == 2 || phase == 3 || phase == 10 || phase == 11 ){
				$("#pick"+phase).append('<img src="/images/godicons/' +data+ '.png">')
			} else {
				$("#pick"+phase).append('<img src="/images/widegodicons/W' +data+ '.png">')
			}
			$('.godBox[id='+data+']').addClass('unavailable');
			$('#name'+phase).html(findLongName(data));
			phase = picks.length;
			console.log('(client) Phase: ' + phase + '. Picks: '+picks);
		});

		socket.on('init', function (data){
			picks = data;
			phase = picks.length;
			drawAllPicks(picks, phase);
			console.log('(client)Initiated; Phase: ' + phase + '. Picks: '+picks);
		})

		socket.on('serverUndo', function (data){
			$('#pick'+(picks.length-1)).empty();
			$('.godBox[id='+picks[picks.length-1]+']').removeClass('unavailable');
			picks = data;
			phase = picks.length;
			$('#name'+phase).empty();
			console.log('(client) Phase: ' + phase + '. Picks: '+picks);

		})



		$('#lockButton').click(function(){
			socket.emit('clientLock', selectedGod);
		})

		$('#resetButton').click(function(){
			socket.emit('reset');
		})

		$('#undoButton').click(function(){
			socket.emit('undo');
		})

		function findLongName(shortname){
			for (var i = 0; i < godData.length; i++){
				if (godData[i].shortname === shortname){
					return godData[i].name;
				}
			}
		}

		function drawAllPicks(picksArr, phase){
			$('.pickIcon').empty();
			$('.banIcon').empty();
			$('.godBox').removeClass('unavailable');
			$('.pickName').empty();
			for(var key in picksArr){
				$('.godBox[id='+picksArr[key]+']').addClass('unavailable');
				
				if (key == 0 || key == 1 || key == 2 || key == 3 || key == 10 || key == 11){
					$("#pick"+key).append('<img src="/images/godicons/' +picksArr[key]+ '.png">');
					console.log(key+' '+picksArr[key]);
				} else {
					$("#pick"+key).append('<img src="/images/widegodicons/W' +picksArr[key]+ '.png">');
					$('#name'+key).append(findLongName(picksArr[key]));
					console.log(key+' '+picksArr[key]);
				}
			}

			picksArr.forEach(function (god){

			})
		}
	});




	// function highlightNextPick(phase){
	// 	switch(phase){
	// 		case '0': $('.pickIcon')
	// 	}
	// }


});