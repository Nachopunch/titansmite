var pbServerModule = (function (io, mongo){

	var serverState = {
		picks: [],
		phase: 0,
		title: 'Untitled',
		collection: 'Default',
		notes: ''
	}


	console.log('created serverPicks: '+serverState.picks);

	mongo.connect('mongodb://localhost/titansmite', function(err, db){
		if (err) throw err;
		console.log("client connected to database: "+ db)

		var savesCol = db.collection('pbSaves');

		// listenForSockets;
		io.on('connection', function (socket){
			console.log("Client connected, new socket issued: "+socket.id);

			//=== Initiate board on socket connect ===
			socket.emit('init', {
				title: serverState.title,
				picks: serverState.picks,
				notes: serverState.notes,
				collection: serverState.collection
			});

			//=== Listen for socket events ===
			socket.on('clientLock', recClientLock);
			socket.on('reset', recClientReset);
			socket.on('undo', recClientUndo);
			socket.on('save', saveDraft)
			socket.on('load', recClientLoad);
			socket.on('getSaves', function(){
				savesCol.find().toArray(function (err, res){
					socket.emit('currentSaves', res);
					console.log(res);
				});
				
				
			});

			function recClientLoad(saveName){
				savesCol.find( {title: saveName} ).toArray(function (err, res){
					if(err){ 
						throw err;
						socket.emit('message', err)
					}

					res.forEach(function (save){
						console.log(save);
						serverState.picks = save.picks;
						serverState.phase = save.picks.length;
						serverState.title = save.title;
						serverState.collection = save.collection;
						serverState.notes = save.notes;
						io.emit('init', {
							title: save.title,
							picks: save.picks,
							notes: save.notes,
							collection: save.collection
						});
						io.emit('message', save.title+" was loaded.")
					})
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
					collection: serverState.collection
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
					savesCol.find({title: data.title}).toArray(function (err, res){
						if (res.length > 0){
							socket.emit('message', 'A save with this name already exists');
						} else {
							socket.emit('message', 'Draft was saved as '+data.title)
							savesCol.insert({
								title: data.title,
								picks: data.picks,
								notes: data.notes,
								collection: data.collection
							});
						}
					});
				}
			}

		});
	});
})



module.exports = pbServerModule;