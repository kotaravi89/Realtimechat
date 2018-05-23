var express = require('express');
var socket = require('socket.io');
var app= express();
var mongoose = require('mongoose');
var session = require('express-session');
var logger = require('morgan');
var path = require ('path');
var fs = require('fs');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

app.use(logger('dev'));
app.use(bodyParser.json({limit:'10mb',extended:true}));
app.use(bodyParser.urlencoded({limit:'10mb',extended:true}));
app.use(cookieParser());


// initialization of session middleware 

app.use(session({
  name :'myCustomCookie',
  secret: 'myAppSecret', // encryption key 
  resave: true,
  httpOnly : true,
  saveUninitialized: true,
  cookie: { secure: false }
}));



// Mongodb database connection
var dbPath  = "mongodb://localhost/chatbox";
db = mongoose.connect(dbPath);
mongoose.connection.once('open', function() {
	console.log("database connection open success");

}); // end connection



// include all our model files
fs.readdirSync('./app/models').forEach(function(file){
	if(file.indexOf('.js'))
	require('./app/models/'+file);

});// end for each



// include controllers
fs.readdirSync('./app/controllers').forEach(function(file){
	if(file.indexOf('.js')){
		var route = require('./app/controllers/'+file);
		route.controllerFunction(app)
	}
});//end for each



// setting up HTML views engine
app.set('views', path.join(__dirname, '/app/views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
// end html view engine

app.use(express.static('public'));

var server = app.listen(3000, function(req,res){
	console.log("app is listening to port no 3000");

});
 
