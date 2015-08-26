var pbModule = (function(){
	var gods = [];
	var picks = [];
	var selectedGod = "";
	var phase = 0;
	

	//cache DOM
	var $el = $('#content');
	var $godsWindow = $el.find('#godsWindow');
	var $lockButton = $el.find('#lockButton');
	var $resetButton = $el.find('#resetButton');
	var $undoButton = $el.find('#undoButton');
	var $pickIcons = $el.find('.pickIcon');
	var $banIcons = $el.find('.banIcon');
	var $pickNames = $el.find('.pickName');
	var $godBoxes = null;
	var $buttons = null;

	//get json God Data
	$.getJSON('/assets/goddata.json', startBoard);

	var socket = io.connect('http://107.170.246.231:80');

	function startBoard(jsonData){
		gods = jsonData;
		console.log("JSON God data has loaded");
		renderGodBoxes();
		bindEvents();
	}

	function renderGodBoxes (){
		gods.forEach(function(god){
			$godsWindow.append('<div class="button godBox noselect" id="'+god.shortname+'"><img class="noselect" src="/images/godicons/' +god.shortname+ '.png"></div>');
		});
		$godBoxes = $el.find('.godBox');
		$buttons = $el.find('.button');
	}

	function bindEvents (){
		//local events
		$godBoxes.click(selectGod);
		$buttons.mousedown(buttonPress);
		$(document).mouseup(buttonUp);
		$(document).keydown(function(event){
			console.log(event);
			
			if((event.which === 32 || event.which === 13) && $('#notesInput').is(":focus") !== true && $('#draftNameInput').is(":focus") !== true){
				event.preventDefault();
				pressLockButton();
			}
		});

		//socket events
		$lockButton.click(pressLockButton);
		$resetButton.click(pressResetButton);
		$undoButton.click(pressUndoButton);
		socket.on('init', syncPicks);
		socket.on('serverLock', serverPickHandler);
		socket.on('serverUndo', undoLastPick);
	}

	function selectGod (){
		$godBoxes.removeClass('selected');
		$(this).addClass('selected');
		selectedGod = $(this).attr('id');
		console.log("Client has selected: "+selectedGod);
	}

	function buttonPress (){
		$(this).addClass("buttonPressed");
	}

	function buttonUp (){
		$buttons.removeClass("buttonPressed");
	}

	function pressLockButton (){
		socket.emit('clientLock', selectedGod);
	}

	function pressResetButton (){
		socket.emit('reset');
	}
	function pressUndoButton(){
		socket.emit('undo');
	}

	function syncPicks(data){
		picks = data;
		phase = data.length;
		console.log("board Synced to Server");
		console.log(data);
		drawPicks(data);
		highlightNextPick();
	}

	function serverPickHandler (data){
		console.log(data + ' was picked');
		picks.push(data);
		drawPicks(data);
		phase = picks.length;
		highlightNextPick;
	}

	function undoLastPick(){
		$el.find('#pick'+(phase-1)).empty();
		$el.find('#name'+(phase-1)).empty();
		$el.find('#'+(picks[phase-1])).removeClass('unavailable');
		picks.pop();
		phase = picks.length;
		highlightNextPick();
	}

	function drawPicks (data){
		if (typeof data === 'object'){
			$pickIcons.empty();
			$banIcons.empty();
			$godBoxes.removeClass('unavailable');
			$pickNames.empty();
			for(var key in data){
				$el.find('#'+data[key]).addClass('unavailable');
				if (key == 0 || key == 1 || key == 2 || key == 3 || key == 10 || key == 11 ){
					$el.find('#pick'+key).html('<img class="noselect" src="/images/godicons/' +data[key]+ '.png">');
				} else {
					$el.find('#pick'+key).html('<img class="noselect" src="/images/widegodicons/W' +data[key]+ '.png">');
					$el.find('#name'+key).html(this.findLongName(data[key]));
				}
			}
		} else if(typeof data === 'string'){
			if (phase == 0 || phase == 1 || phase == 2 || phase == 3 || phase == 10 || phase == 11 ){
				$el.find('#pick'+phase).html('<img class="noselect" src="/images/godicons/' +data+ '.png">');
			} else {
				$el.find('#pick'+phase).html('<img class="noselect" src="/images/widegodicons/W' +data+ '.png">');
			}
			$el.find('#'+data).addClass('unavailable');
			$el.find('#name'+phase).html(findLongName(data));
		}
	}
	function findLongName(shortname){
		for (var i = 0; i < gods.length; i++){
				if (gods[i].shortname === shortname){
					return gods[i].name;
				}
			}
	}
	function highlightNextPick(){
		switch(phase){
			case 0:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick0').addClass('nextPick');
				break;
			case 1:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick1').addClass('nextPick');
				break;
			case 2:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick2').addClass('nextPick');
				
				break;
			case 3:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick3').addClass('nextPick');
				break;
			case 4:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick4').addClass('nextPick');
				break;
			case 5:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick5').addClass('nextPick');
				$el.find('#pick6').addClass('nextPick');
				break;
			case 6:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick6').addClass('nextPick');
				break;
			case 7:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick7').addClass('nextPick');
				$el.find('#pick8').addClass('nextPick');
				break;
			case 8:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick8').addClass('nextPick');
				break;
			case 9:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick9').addClass('nextPick');
				break;
			case 10:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick10').addClass('nextPick');
				break;
			case 11:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick11').addClass('nextPick');
				break;
			case 12:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick12').addClass('nextPick');
				break;
			case 13:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick13').addClass('nextPick');
				$el.find('#pick14').addClass('nextPick');
				break;
			case 14:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');
				$el.find('#pick14').addClass('nextPick');
				break;
			case 15:
				$pickIcons.removeClass('nextPick');
				$banIcons.removeClass('nextPick');;
				$el.find('#pick15').addClass('nextPick');
				break;
		}
	}

//exposed API
	return{
		pressResetButton: pressResetButton

	}
})();