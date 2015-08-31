var pbModule = (function(){
	var gods = [];
	var picks = [];
	var selectedGod = "";
	var phase = picks.length;
	var saves = [];
	var albums = [];

	//cache DOM
	var $el = $('body');
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
	var $collectionAddButton = $el.find('#collectionAddButton');
	var $viewSavesWindow = $el.find('#viewSavesWindow');
	var $saveSelectorWindow = $el.find('#saveSelectorWindow');
	var $albumFilter = $el.find('#albumFilter');

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

	function loadDraft (title){
		console.log("loading: "+title);
		$viewSavesWindow.css('display', 'none');
		socket.emit('load', title);
	}

	function bindEvents (){
		//local events

		$loadButton.click(function(){
			$saveSelectorWindow.empty();
			$viewSavesWindow.css('display', 'block');
			socket.emit('getSaves');
		});

		$godBoxes.click(selectGod);
		$buttons.mousedown(buttonPress);
		$(document).mouseup(buttonUp);
		$(document).keydown(function(event){
			// console.log(event);
			if((event.which === 32 || event.which === 13) && $('#notesInput').is(":focus") !== true && $('#draftNameInput').is(":focus") !== true){
				event.preventDefault();
				pressLockButton();
			}
			if(event.which === 27){
				$viewSavesWindow.css('display', 'none');
			}
		});

		$notesInput.on("change keyup paste", function(){
			socket.emit('notesChanged', $notesInput.val());
		});

		$albumFilter.on("change", function(){
			$saveSelectorWindow.empty();
			drawSaveIcons(saves);
		});

		$collectionAddButton.click(function(){
			var newAlbum = prompt("New album name:");
			if(newAlbum){
				socket.emit('addAlbum', newAlbum);
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
		socket.on('currentSaves', updateSaves);
		socket.on('message', displayMessage);
		socket.on('updateNotes', function (newNotes){
			$notesInput.empty().val(newNotes);
		});
		socket.on('updateAlbumList', function (newAlbums){
			albums = newAlbums;
			makeAlbumList(albums);
		});

	}

	var saveIconTemplate = $('#saveIconTemplate').html();

	function updateSaves (res){
		saves = res;
		drawSaveIcons(saves);
	}

	function drawSaveIcons (toDraw){

		toDraw.forEach(function (save){
			if (save.album === $albumFilter.val() || $albumFilter.val() === "All"){
				var team1Bans = [];
				var team2Bans = [];
				var team1Picks = [];
				var team2Picks = [];

				if(save.picks[0]){team1Bans.push(save.picks[0])}
				if(save.picks[1]){team2Bans.push(save.picks[1])}
				if(save.picks[2]){team1Bans.push(save.picks[2])}
				if(save.picks[3]){team2Bans.push(save.picks[3])}
				if(save.picks[4]){team1Picks.push(save.picks[4])}
				if(save.picks[5]){team2Picks.push(save.picks[5])}
				if(save.picks[6]){team2Picks.push(save.picks[6])}
				if(save.picks[7]){team1Picks.push(save.picks[7])}
				if(save.picks[8]){team1Picks.push(save.picks[8])}
				if(save.picks[9]){team2Picks.push(save.picks[9])}
				if(save.picks[10]){team2Bans.push(save.picks[10])}
				if(save.picks[11]){team1Bans.push(save.picks[11])}
				if(save.picks[12]){team2Picks.push(save.picks[12])}
				if(save.picks[13]){team1Picks.push(save.picks[13])}
				if(save.picks[14]){team1Picks.push(save.picks[14])}
				if(save.picks[15]){team2Picks.push(save.picks[15])}

				// console.log(team1Bans);
				// console.log(Mustache.to_html(saveIconTemplate, {id: save._id, title: save.title, picks: save.picks}));
				$saveSelectorWindow.append(Mustache.to_html(saveIconTemplate, {
					id: save._id,
					title: save.title,
					team1Bans: team1Bans,
					team2Bans: team2Bans,
					team1Picks: team1Picks,
					team2Picks: team2Picks,
					notes: save.notes
				}));
			}
		});

		$('.saveIcon').click(function(){
			loadDraft($(this).attr('id'));
		});
		$('.deleteSaveButton').click(function(evt){
			evt.stopPropagation();
			var thisID = $(this).parent().attr('id');
			if(confirm("Delete this save?")){
				socket.emit('deleteSave', thisID);
				$viewSavesWindow.css('display', 'none');
			}
		})

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
		socket.emit('message', "Drafts have been reset...");
	}
	function pressUndoButton(){
		socket.emit('undo');
	}

	function pressSaveButton(){
		socket.emit('save', {
			title: $draftNameInput.val(),
			picks: picks,
			notes: $notesInput.val(),
			album: $collectionInput.val()
		});
	}

	function syncPicks(data){
		picks = data.picks;
		console.log("syncing");
		console.log(data);
		phase = data.picks.length;
		$notesInput.val(data.notes);
		$collectionInput.val(data.album);
		albums = data.albumList;
		$draftNameInput.val(data.title);
		console.log("board Synced to Server");
		console.log(data);
		console.log(phase);
		drawPicks(data.picks);
		highlightNextPick();
		makeAlbumList(albums);
	}

	function makeAlbumList (albs){
		$collectionInput.empty();
		$albumFilter.empty();
		$albumFilter.append("<option>All</option>")
		albs.forEach(function(alb){
			$collectionInput.append("<option>"+alb+"</option>");
			$albumFilter.append("<option>"+alb+"</option>")
		});

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