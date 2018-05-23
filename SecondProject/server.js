var express = require('express');
var socket = require('socket.io');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var app = express();

app.use(express.static('public'));
var server = app.listen(3000,function(){
	console.log("The server is listening on the port 3000");
});

var io = socket(server);

var chatSchema = mongoose.Schema({
	username	: {type:String},
	message		: {type:String},
	created		: {type: Date , default: Date.now}
})

var friendSchema = mongoose.Schema({
	friendName: {type: String},
	sentOn	  : {type: Date}
})

var Chat = mongoose.model('chatonetoone',chatSchema);
var Friend = mongoose.model('FriendsData', friendSchema);


io.on('connection', function(socket){

	console.log("inside connection")
	
	var query = Chat.find({});
	query.sort('-created').limit(4).exec(
	function(err,data){
		if (err) {
			res.send(err);
		}
			io.sockets.emit("chat history", data);
	}); 

	socket.on("logout", function(data){
		socket.broadcast.emit("logout",data);
	})

	socket.on("chat", function(data){
		
		var newMsg  = new Chat(data);
		newMsg.save(function(err){
			if(err){
				res.send(err);
			}
			else{
				console.log("chat saved in DB sucessfully");
				io.sockets.emit("chat", data);
			}
		})	
	});

	socket.on("typing", function (data){	
		socket.broadcast.emit("typing", data);
	});

	// code for all users which are on platform
		var allusers = [];
		socket.on("login", function(data){
		socket.allusers = data;
		allusers.push(socket.allusers);
		socket.broadcast.emit("login",data);
		console.log(allusers)
	})

	// socket to get all users who are connected to platform
	socket.on("usernames",function(data){
		socket.broadcast.emit("usernames",allusers);
	})

	// Handling friend reqest.
	socket.on('friendReq', function(err,data){

		if(data){
			// user accepts reqest and emited an event
			socket.emit("acceptReq", data)
		}
		else if(err){
					// user Declines the add request
			socket.emit("rejectReq", {message: "friend Rejected your request"})
		}
	}) // end handling friend reqest.

});