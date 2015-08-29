var mongoose = require('mongoose');

var pbServerModule = (function (io){

	var pbsaves = mongoose.model('pbsaves');
	var serverState = {
		picks: [],
		phase: 0,
		title: 'Untitled',
		album: 'Default',
		notes: ''
	}

	console.log('created serverPicks: '+serverState.picks);

	// listenForSockets;
	io.on('connection', function (socket){
		console.log("Client connected, new socket issued: "+socket.id);

		//=== Initiate board on socket connect ===
		socket.emit('init', {
			title: serverState.title,
			picks: serverState.picks,
			notes: serverState.notes,
			album: serverState.album
		});

		//=== Listen for socket events ===
		socket.on('clientLock', recClientLock);
		socket.on('reset', recClientReset);
		socket.on('undo', recClientUndo);
		socket.on('save', saveDraft)
		socket.on('load', recClientLoad);
		socket.on('getSaves', function(){
			pbsaves.find(function (err, res){
				socket.emit('currentSaves', res);
				console.log(res);
			});
		});

		function recClientLoad(saveName){
			pbsaves.findOne( {title: saveName},  function (err, savedDraft){
				if(err){
					throw err;
					socket.emit('message', err)
				}
					console.log(savedDraft);
					serverState.picks = savedDraft.picks;
					serverState.phase = savedDraft.picks.length;
					serverState.title = savedDraft.title;
					serverState.album = savedDraft.album;
					serverState.notes = savedDraft.notes;
					io.emit('init', {
						title: savedDraft.title,
						picks: savedDraft.picks,
						notes: savedDraft.notes,
						album: savedDraft.album
					});
					io.emit('message', savedDraft.title+" was loaded.")
			});
		}

		//recieve client lock function
		function recClientLock (data){
			console.log("recieved clientLock: "+data);

			// check if new pick has already been picked
		    if (data && serverState.picks.indexOf(data) === -1 && serverState.phase < 16){

				//broadcast new pick to clients
				io.emit('serverLock', data);
				serverState.picks.push(data);
				serverState.phase = serverState.picks.length;
				console.log('client '+socket.id+' has picked '+data);
				console.log('(server) Phase: ' + serverState.phase + '. Picks: '+serverState.picks);
				console.log('current phase(server): '+serverState.phase);
			}
		}

		//recieve client reset function
		function recClientReset (){
			serverState.picks = [];
			serverState.phase = serverState.picks.length;
			serverState.notes = '';
			serverState.title = 'Untitled';
			console.log("The picks have been reset(server): "+serverState.picks);
			console.log('(server) Phase: ' + serverState.phase + '. Picks: '+serverState.picks);
	    	io.emit('init', {
				title: serverState.title,
				picks: serverState.picks,
				notes: serverState.notes,
				album: serverState.album
			});
		}

		//recieve client undo function
		function recClientUndo (){
			serverState.picks.pop();
			serverState.phase = serverState.picks.length;
			console.log('Last pick was undone');
			console.log('current picks(server): '+serverState.picks);
			io.emit('serverUndo', serverState.picks);
		}

		function saveDraft(data){
			var whitespacePatt = /^\s*$/
			if(whitespacePatt.test(data.title) === true){
				socket.emit('message', 'Invalid draft name');
			} else{
				pbsaves.find({title: data.title}, function (err, res){
					if (res.length > 0){
						socket.emit('message', 'A save with this name already exists');
					} else {
						socket.emit('message', 'Draft was saved as '+data.title)
						pbsaves.create({
							title: data.title,
							picks: data.picks,
							notes: data.notes,
							album: data.album
						});
					}
				});
			}
		}
	});
})



module.exports = pbServerModule;