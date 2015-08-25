var pbModule = {
	gods: [],
	picks: [],
	selectedGod: "",
	phase: 0,
	socket: null,

	//initiate module
	init: function(){
		this.cacheDom();
		this.loadGods();
		this.getSocket();

	},
	
	getSocket: function(){
		this.socket = io.connect('http://107.170.246.231:80');
		console.log(this.socket);
	},

	loadGods: function(){
		//Loads the json file containing the god information
		$.getJSON('/assets/goddata.json', this.startBoard.bind(this));
	},

	startBoard: function(response){
			this.gods = response;
			console.log("JSON data loaded");
			// console.log("gods: ");
			// console.log(module.gods);
			this.renderGodButtons();
			this.bindEvents();
	},

	cacheDom: function() {
		this.$el = $('#content');
		this.$godsWindow = this.$el.find('#godsWindow');
		this.$lockButton = this.$el.find('#lockButton');
		this.$resetButton = this.$el.find('#resetButton');
		this.$undoButton = this.$el.find('#undoButton');
		this.$pickIcons = this.$el.find('.pickIcon');
		this.$banIcons = this.$el.find('.banIcon');
		this.$pickNames = this.$el.find('.pickName');
	},

	renderGodButtons: function(){
		this.gods.forEach(function(god){
			pbModule.$godsWindow.append('<div class="button godBox noselect" id="'+god.shortname+'"><img class="noselect" src="/images/godicons/' +god.shortname+ '.png"></div>');
		});
		this.$godBoxes = this.$el.find('.godBox');
		this.$buttons = this.$el.find('.button');
	},

	bindEvents: function(){
		//local events
		this.$godBoxes.click(this.selectGod);
		this.$buttons.mousedown(this.buttonPress);
		$(document).mouseup(this.buttonUp.bind(this));
		$(document).keydown(function(event){
			console.log(event);
			event.preventDefault();
			if(event.which === 32 || event.which === 13){
				pbModule.pressLockButton();
			}
		});

		//socket events
		this.$lockButton.click(this.pressLockButton.bind(this));
		this.$resetButton.click(this.pressResetButton.bind(this));
		this.$undoButton.click(this.pressUndoButton.bind(this));
		this.socket.on('init', this.syncPicks.bind(this));
		this.socket.on('serverLock', this.serverPickHandler.bind(this));
		this.socket.on('serverUndo', this.undoLastPick.bind(this));
	},

	// UI and buttons functions
	selectGod: function(){
		pbModule.$godBoxes.removeClass('selected');
		$(this).addClass('selected');
		pbModule.selectedGod = $(this).attr('id');
		console.log("Client has selected: "+pbModule.selectedGod);
	},

	buttonPress: function(){
		$(this).addClass("buttonPressed");
	},

	buttonUp: function(){
		this.$buttons.removeClass("buttonPressed");
	},

	pressLockButton: function(){
		this.socket.emit('clientLock', this.selectedGod);
	},

	pressResetButton: function(){
		this.socket.emit('reset');
	},

	pressUndoButton: function(){
		this.socket.emit('undo');
	},
	//

	syncPicks: function(data){
		this.picks = data;
		this.phase = data.length
		console.log("Board Synced to Server")
		console.log(data);
		this.drawPicks(data);
		this.highlightNextPick();
	},

	serverPickHandler: function(data){
		console.log(data+" was picked")
		this.picks.push(data);
		this.drawPicks(data);
		this.phase = this.picks.length;
		this.highlightNextPick();

	},

	undoLastPick: function(){
		this.$el.find('#pick'+(this.phase-1)).empty();
		this.$el.find('#name'+(this.phase-1)).empty();
		this.$el.find('#'+(this.picks[this.phase-1])).removeClass('unavailable');
		this.picks.pop();
		this.phase = this.picks.length;
		this.highlightNextPick();
	},

	drawPicks: function(picks){
		if (typeof picks === 'object'){
			this.$pickIcons.empty();
			this.$banIcons.empty();
			this.$godBoxes.removeClass('unavailable');
			this.$pickNames.empty();
			for(var key in picks){
				this.$el.find('#'+picks[key]).addClass('unavailable');
				if (key == 0 || key == 1 || key == 2 || key == 3 || key == 10 || key == 11 ){
					this.$el.find('#pick'+key).html('<img class="noselect" src="/images/godicons/' +picks[key]+ '.png">');
				} else {
					this.$el.find('#pick'+key).html('<img class="noselect" src="/images/widegodicons/W' +picks[key]+ '.png">');
					this.$el.find('#name'+key).html(this.findLongName(picks[key]));
				}
			}
		} else if(typeof picks === 'string'){
			if (this.phase == 0 || this.phase == 1 || this.phase == 2 || this.phase == 3 || this.phase == 10 || this.phase == 11 ){
				this.$el.find('#pick'+this.phase).html('<img class="noselect" src="/images/godicons/' +picks+ '.png">');
			} else {
				this.$el.find('#pick'+this.phase).html('<img class="noselect" src="/images/widegodicons/W' +picks+ '.png">');
			}
			this.$el.find('#'+picks).addClass('unavailable');
			this.$el.find('#name'+this.phase).html(this.findLongName(picks));
		}
	},

	findLongName: function(shortname){
		for (var i = 0; i < this.gods.length; i++){
				if (this.gods[i].shortname === shortname){
					return this.gods[i].name;
				}
			}
	},

	highlightNextPick: function(){
		switch(this.phase){
			case 0:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick0').addClass('nextPick');
				break;
			case 1:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick1').addClass('nextPick');
				break;
			case 2:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick2').addClass('nextPick');
				
				break;
			case 3:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick3').addClass('nextPick');
				break;
			case 4:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick4').addClass('nextPick');
				break;
			case 5:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick5').addClass('nextPick');
				this.$el.find('#pick6').addClass('nextPick');
				break;
			case 6:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick6').addClass('nextPick');
				break;
			case 7:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick7').addClass('nextPick');
				this.$el.find('#pick8').addClass('nextPick');
				break;
			case 8:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick8').addClass('nextPick');
				break;
			case 9:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick9').addClass('nextPick');
				break;
			case 10:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick10').addClass('nextPick');
				break;
			case 11:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick11').addClass('nextPick');
				break;
			case 12:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick12').addClass('nextPick');
				break;
			case 13:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick13').addClass('nextPick');
				this.$el.find('#pick14').addClass('nextPick');
				break;
			case 14:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');
				this.$el.find('#pick14').addClass('nextPick');
				break;
			case 15:
				this.$pickIcons.removeClass('nextPick');
				this.$banIcons.removeClass('nextPick');;
				this.$el.find('#pick15').addClass('nextPick');
				break;
		}
	}
};

pbModule.init();

