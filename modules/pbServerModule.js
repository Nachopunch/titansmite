var pbServerModule = (function (io, mongo){


	var serverPicks = [];
	var serverPhase = 0;
	// var serverBoardState = {
	// 	title: "untitled",
	// 	picks:
	// };

	console.log('created serverPicks: '+serverPicks);

	mongo.connect('mongodb://localhost/titansmite', function(err, db){
		if (err) throw err;
		console.log("client connected to database: "+ db)

		var savesCol = db.collection('pbSaves');

		// listenForSockets;
		io.on('connection', function (socket){
			console.log("Client connected, new socket issued: "+socket.id);

			//=== Initiate board on socket connect ===
			socket.emit('init', serverPicks);

			//=== Listen for socket events ===
			socket.on('clientLock', recClientLock);
			socket.on('reset', recClientReset);
			socket.on('undo', recClientUndo);
			socket.on('save', saveDraft)

			//recieve client lock function
			function recClientLock (data){
				console.log("recieved clientLock: "+data);

				// check if new pick has already been picked
			    if (data && serverPicks.indexOf(data) === -1 && serverPhase < 16){

					//broadcast new pick to clients
					io.emit('serverLock', data);
					serverPicks.push(data);
					serverPhase = serverPicks.length;
					console.log('client '+socket.id+' has picked '+data);
					console.log('(server) Phase: ' + serverPhase + '. Picks: '+serverPicks);
					console.log('current phase(server): '+serverPhase);
				}
			}
			//recieve client reset function
			function recClientReset (){
				serverPicks = [];
				serverPhase = serverPicks.length;
				console.log("The picks have been reset(server): "+serverPicks);
				console.log('(server) Phase: ' + serverPhase + '. Picks: '+serverPicks);
		    	io.emit('init', serverPicks);
			}
			//recieve client undo function
			function recClientUndo (){
				serverPicks.pop();
				serverPhase = serverPicks.length;
				console.log('Last pick was undone');
				console.log('current picks(server): '+serverPicks);
				io.emit('serverUndo', serverPicks);
			}

			function saveDraft(data){
				var whitespacePatt = /^\s*$/
				if(whitespacePatt.test(data.name) !== true){
					savesCol.insert({
						title: data.title,
						picks: data.picks,
						notes: data.notes,
						collection: data.collection
					});
				}
			}

		});
	});
})



module.exports = pbServerModule;