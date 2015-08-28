var pbModule = (function(){
	var gods = [];
	var picks = [];
	var selectedGod = "";
	var phase = picks.length;
	var saves = [];

	//cache DOM
	var $el = $('#content');
	var $godsWindow = $el.find('#godsWindow');
	var $lockButton = $el.find('#lockButton');
	var $resetButton = $el.find('#resetButton');
	var $undoButton = $el.find('#undoButton');
	var $saveButton = $el.find('#saveButton');
	var $loadButton = $el.find('#loadButton');
	var $pickIcons = $el.find('.pickIcon');
	var $banIcons = $el.find('.banIcon');
	var $pickNames = $el.find('.pickName');
	var $statusWindow = $el.find('#statusWindow');

	var $draftNameInput = $el.find('#draftNameInput');
	var $notesInput = $el.find('#notesInput');
	var $collectionInput = $el.find('#collectionInput');
	var $viewSavesWindow = $el.find('#viewSavesWindow');

	var $godBoxes = null;
	var $buttons = null;

	//get json God Data
	$.getJSON('/assets/goddata.json', startBoard);

	var socket = io.connect('http://localhost:80');

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

	function loadDraft (title){
		console.log("loading: "+title);
		$viewSavesWindow.css('display', 'none');
		socket.emit('load', title)
	}

	function bindEvents (){
		//local events
		

		$loadButton.click(function(){
			$viewSavesWindow.css('display', 'block');
			socket.emit('getSaves');
		})

		$godBoxes.click(selectGod);
		$buttons.mousedown(buttonPress);
		$(document).mouseup(buttonUp);
		$(document).keydown(function(event){
			console.log(event);
			if((event.which === 32 || event.which === 13) && $('#notesInput').is(":focus") !== true && $('#draftNameInput').is(":focus") !== true){
				event.preventDefault();
				pressLockButton();
			}
			if(event.which === 27){
				$viewSavesWindow.css('display', 'none');
			}
		});

		//socket events
		$lockButton.click(pressLockButton);
		$resetButton.click(pressResetButton);
		$undoButton.click(pressUndoButton);
		$saveButton.click(pressSaveButton);
		socket.on('init', syncPicks);
		socket.on('serverLock', serverPickHandler);
		socket.on('serverUndo', undoLastPick);
		socket.on('currentSaves', function(res){
			$viewSavesWindow.empty();
			res.forEach(function(save){
				$viewSavesWindow.append('<div class="saveIcon" id="'+save.title+'">'+save.title+'</div>');
			});

			$('.saveIcon').click(function(){
				loadDraft($(this).attr('id'));
			});

		});
		socket.on('message', displayMessage)
	}

	function displayMessage (message){
		$statusWindow.html("<p>"+message+"</p>")
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

	function pressSaveButton(){
		socket.emit('save', {
			title: $draftNameInput.val(),
			picks: picks,
			notes: $notesInput.val(),
			collection: $collectionInput.val()
		});
	}

	function syncPicks(data){
		picks = data.picks;
		console.log("syncing");
		console.log(data);
		phase = data.picks.length;
		$notesInput.val(data.notes);
		$collectionInput.val(data.collection);
		$draftNameInput.val(data.title);
		console.log("board Synced to Server");
		console.log(data);
		console.log(phase);
		drawPicks(data.picks);
		highlightNextPick();
	}

	function serverPickHandler (data){
		console.log(data + ' was picked');
		picks.push(data);
		drawPicks(data);
		phase = picks.length;
		highlightNextPick();
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
					$el.find('#name'+key).html(findLongName(data[key]));
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





	function showGods(){
		console.log(gods);
	}
	function showPicks(){
		console.log(picks);
	}
	function showPhase(){
		console.log(phase);
	}

//exposed API
	return{
		pressResetButton: pressResetButton,
		phase: showPhase,
		picks:showPicks,
		gods:showGods,
		highlightNextPick: highlightNextPick

	}
})();