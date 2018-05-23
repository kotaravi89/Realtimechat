

// defining a mongoose schema
// inculuding the module
var mongoose = require('mongoose');
//declare schema object.
var Schema = mongoose.Schema;
var userSchema = new Schema({

	userName : {type:String,default:'', required: true},
	firstName: {type:String, default:''},
	lastName : {type:String, default:''},
	email	 : {type:String, default:''},
	mobileNunber	 : {type:Number, default:''},
	password : {type:String, default:''}
});

mongoose.model('User',userSchema);

