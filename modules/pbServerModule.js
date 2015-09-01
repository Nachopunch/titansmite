var mongoose = require('mongoose');

var pbServerModule = (function (io){

	var pbsaves = mongoose.model('pbsaves');
	var serverState = {
		picks: [],
		phase: 0,
		title: 'untitled',
		album: 'default',
		notes: '',
		albumList: ["default"]
	}

	console.log('created serverPicks: '+serverState.picks);

	pbsaves.find(function (err, res){
		res.forEach(function(save){
			if(serverState.albumList.indexOf(save.album) === -1){
				serverState.albumList.push(save.album);
			}
		});
	});

	// listenForSockets;
	io.on('connection', function (socket){
		console.log("Client connected, new socket issued: "+socket.id);
		console.log("")

		//=== Initiate board on socket connect ===
		socket.emit('init', {
			title: serverState.title,
			picks: serverState.picks,
			notes: serverState.notes,
			album: serverState.album,
			albumList: serverState.albumList
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
		socket.on('deleteSave', function (id){
			console.log("removing save "+id);
			pbsaves.find({"_id":id}).remove().exec();
		});
		socket.on('notesChanged', function(newNotes){
			serverState.notes = newNotes;
			socket.broadcast.emit('updateNotes', newNotes);
		});
		socket.on('addAlbum', function(albumToAdd){
			if(serverState.albumList.indexOf(albumToAdd) > 0){
				socket.emit('message', "An album with that name already exists");
			}else{
				serverState.albumList.push(albumToAdd);
				io.emit('updateAlbumList', serverState.albumList);
			}
		});

		function recClientLoad(saveID){
			pbsaves.findOne( {"_id": saveID},  function (err, savedDraft){
				if(err){
					throw err;
					socket.emit('message', err)
				} if (savedDraft){
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
						album: savedDraft.album,
						albumList: serverState.albumList
					});
					io.emit('message', "Loaded draft: "+savedDraft.title);
				}
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
			// serverState.notes = '';
			// serverState.title = 'untitled';
			console.log("The picks have been reset(server): "+serverState.picks);
			console.log('(server) Phase: ' + serverState.phase + '. Picks: '+serverState.picks);
	    	io.emit('boardReset', {
				picks: serverState.picks
			});
			io.emit('message', "The board has been reset");
		}

		//recieve client undo function
		function recClientUndo (){
			serverState.picks.pop();
			serverState.phase = serverState.picks.length;
			console.log('Last pick was undone');
			console.log('current picks(server): '+serverState.picks);
			io.emit('serverUndo', serverState.picks);
			io.emit('message', "Last pick has been undone");
		}

		function saveDraft(data){
			var whitespacePatt = /^\s*$/
			if(whitespacePatt.test(data.title) === true){
				socket.emit('alert', 'Invalid Draft name.');
			} else{
				pbsaves.find({title: data.title}, function (err, res){
					if (res.length > 0){
						socket.emit('alert', 'A save with this name already exists.');
					} else {
						io.emit('message', 'Draft was saved as: '+data.title)
						socket.emit('alert', 'Draft was saved as: '+data.title)
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