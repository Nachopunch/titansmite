
var www = require('../bin/www');
var io = require('socket.io')(www.server);
var pbServerModule = {



	serverPicks: [],
	serverPhase: 0,

	init: function(){
		console.log('created serverPicks: '+this.serverPicks);
		io.on('connection', function (socket){console.log(socket)});
		// this.listenForSockets;
	},

	listenForSockets: function(){
		io.on('connection', function (socket){console.log(socket)}/*this.listenForSocketEvents(socket)*/);
	},

	listenForSocketEvents: function(socket){
		console.log(socket);
		socket.emit('init', this.serverPicks);

		socket.on('clientLock', this.recClientLock(socket).bind(this));
	},

	recClientLock: function(data){
		console.log("recieved clientLock: "+data);

		// check if new pick has already been picked
	    if (data && this.serverPicks.indexOf(data) === -1 && this.serverPhase < 16){

		      //broadcast new pick to clients
		      io.emit('serverLock', data);
		      this.serverPicks.push(data);
		      this.serverPhase = this.serverPicks.length;
		      console.log('client '+socket.id+' has picked '+data);
		      console.log('(server) Phase: ' + this.serverPhase + '. Picks: '+this.serverPicks);
		      console.log('current phase(server): '+this.serverPhase);
		    }
	}
}




module.exports = pbServerModule;