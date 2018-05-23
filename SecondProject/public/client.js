
// below mentioned variable are took for the purpose of front purpose
// which can be used as per the requirement.
// complete front end is not developed.

var socket = io.connect("http://localhost:3000");
var socket = io.connect();
var message = document.getElementById("message");
var username = document.getElementById("username");
var sendbtn = document.getElementById("send");
var loginbtn = document.getElementById("Login");
var logoutbtn = document.getElementById("Logout");
var output = document.getElementById("output");
var feedback = document.getElementById("feedback");
var online   = document.getElementById("online");
var error		= document.getElementById("error");
var sendFriendReqbtn = document.getElementById("sendFriendReqbtn");
var acceptbtn		= document.getElementById("acceptbtn");
var rejectbtn	= document.getElementById("rejectbtn");
var SendFriendReq = document.getElementById("SendFriendReq");


// logout button on click event
logoutbtn.addEventListener("click", function(){

		socket.emit("logout", {username:username.value});
		window.location = 'http://localhost:3000';
})

// message sending chat with sendBtn event listener
sendbtn.addEventListener("click",function(){
	socket.emit("chat", {message:message.value,username:username.value});
	
});


// Key press event weather the user is typing or not
message.addEventListener("keypress", function(){
	socket.emit("typing", username.value);
});

socket.on("logout", function(data){
	console.log("user logged out");
	online.outerHTML = '<p><strong>' + data.username + 'is logout from chat </strong></p>';
	output.innerHTML += '<p><em>' + data.username + ' is offline now..... </p></em>' ;
})

socket.on("chat", function(data){
	displaymsgs(data);
});

function displaymsgs(data){
	feedback.innerHTML = "";
	output.innerHTML += '<p><strong>' + data.username + ':</strong>' +
	data.message + '</p>';
}

socket.on("typing", function(data){
	feedback.innerHTML = '<p><em>' + data + ' is typing message..... </p></em>' ;
});



socket.on("chat history", function(data){
	for(var i=data.length-1; i >=0; i--){
		displaymsgs(data[i]);
	}
});

// sending friend reqest to particular user present on platform.
sendFriendReqbtn.addEventListener("click",function(){
	socket.emit('friendReq', {username: username.value });
});

acceptbtn.addEventListener("click",function(){
	socket.emit('acceptReq', {username: username.value });
})

rejectbtn.addEventListener("click", function(){
	socket.emit('rejectReq', {username: username.value });
})


// socket for request accept
var friendsList =[];
socket.on("acceptReq", function(data){
	console.log("user accepted your reqest")
	socket.friendsList = data;
	friendsList.push(socket.friendsList);
	console.log(" friends List updated")
})

// socket for reqest reject
socket.on("rejectReq", function(data){
	console.log("user reject the friendreqest which is recieved.")
	console.log(data.message);
})


