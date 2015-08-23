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
		var socket = io.connect('http://107.170.246.231:80');			console.log(socket);

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
			highlightNextPick(phase);
			console.log('(client) Phase: ' + phase + '. Picks: '+picks);
		});

		socket.on('init', function (data){
			picks = data;
			phase = picks.length;
			drawAllPicks(picks, phase);
			highlightNextPick(phase);
			console.log('(client)Initiated; Phase: ' + phase + '. Picks: '+picks);
		})

		socket.on('serverUndo', function (data){
			$('#pick'+(picks.length-1)).empty();
			$('.godBox[id='+picks[picks.length-1]+']').removeClass('unavailable');
			picks = data;
			phase = picks.length;
			$('#name'+phase).empty();
			console.log('(client) Phase: ' + phase + '. Picks: '+picks);
			highlightNextPick(phase);

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

			highlightNextPick(phase);
		}

		function highlightNextPick(phase){
			switch(phase){
				case 0:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick0').addClass('nextPick');
					break;
				case 1:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick1').addClass('nextPick');
					break;
				case 2:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick2').addClass('nextPick');
					break;
				case 3:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick3').addClass('nextPick');
					break;
				case 4:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick4').addClass('nextPick');
					break;
				case 5:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick5').addClass('nextPick');
					$('#pick6').addClass('nextPick');
					break;
				case 6:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick5').addClass('nextPick');
					$('#pick6').addClass('nextPick');
					break;
				case 7:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick7').addClass('nextPick');
					$('#pick8').addClass('nextPick');
					break;
				case 8:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick7').addClass('nextPick');
					$('#pick8').addClass('nextPick');
					break;
				case 9:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick9').addClass('nextPick');
					break;
				case 10:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick10').addClass('nextPick');
					break;
				case 11:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick11').addClass('nextPick');
					break;
				case 12:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick12').addClass('nextPick');
					break;
				case 13:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick13').addClass('nextPick');
					$('#pick14').addClass('nextPick');
					break;
				case 14:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick13').addClass('nextPick');
					$('#pick14').addClass('nextPick');
					break;
				case 15:
					$('.pickIcon').removeClass('nextPick');
					$('.banIcon').removeClass('nextPick');
					$('#pick15').addClass('nextPick');
					break;
			}
		}
	});
});