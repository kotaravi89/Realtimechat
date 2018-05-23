
var express = require("express");
var userRouter= express.Router();
var mongoose = require("mongoose");
var userModel = mongoose.model('User');
var app = express();
var nodemailer = require('nodemailer');
var path = require("path");


var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth2').Strategy;
var session = require('express-session');


var responseGenerator = require('./../../libs/responseGenerator');
var userAuth = require("./../../middlewares/userAuth");


module.exports.controllerFunction = function(app) { 

	userRouter.get("/userSignup", function (req,res) {
		console.log("inside singup");
		res.render('userSignup.html');	
	});

	userRouter.get("/userLogin", function (req,res) {
		console.log(" inside login");
		res.render('userLogin.html');
	});


  userRouter.get("/chatPlace", function(req,res){
      console.log("inside chatPlace");
      res.redirect('http://localhost:3000/');
    });

	userRouter.get("/userLogout", function(req,res){
		console.log("inside logout");
		res.render("userLogin.html")
	})



    // API for userSignup

	userRouter.post('/userSignup',function(req,res){

        if(req.body.firstName!=undefined && req.body.lastName!=undefined && req.body.email!=undefined && req.body.password!=undefined){
           console.log("inside signup post")
            var newUser = new userModel({
                userName            : req.body.firstName+''+req.body.lastName,
                firstName           : req.body.firstName,
                lastName            : req.body.lastName,
                email               : req.body.email,
                mobileNumber        : req.body.mobileNumber,
                password            : req.body.password

            });// end new user 

            newUser.save(function(err){
                if(err){

                    var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
                    res.send(myResponse);

                }
                else{
                	 
                   req.session.user = newUser;
                   delete req.session.user.password;
                   res.redirect('/users/userLogin');
                   
                }

            });//end new user save

        }
        else{

            var myResponse = {
                error: true,
                message: "Some body parameter is missing",
                status: 403,
                data: null
            };

            res.send(myResponse);
        }

    });//end user Signup


  // API for userLogin
 
	userRouter.post('/userLogin',function(req,res){

	        userModel.findOne({$and:[{'email':req.body.email},{'password':req.body.password}]},function(err,foundUser){
	            if(err){
	                var myResponse = responseGenerator.generate(true,"some error"+err,500,null);
	                res.send(myResponse);
	            }
	            else if(foundUser==null || foundUser==undefined || foundUser.userName==undefined){

	                var myResponse = responseGenerator.generate(true,"user not found. Check your email and password",404,null);
	                res.send(myResponse);       
	            }
	            else{

	                  req.session.user = foundUser;
	                  delete req.session.user.password;
	                  console.log("successfully logged into allUserProducts");
	                  res.redirect("/users/chatPlace");
                    
	            }
	        });// end find
	    });// end userLogin
    

    // route for userForgetPassword and email checking for the password.
    
    userRouter.post('/forgetPassword', function(req,res){
        console.log("inside forgetPassword")
        userModel.findOne({'email': req.body.email}, function(err,foundUser ){
             console.log("inside forgetPassword")
            if(!foundUser){
                var myResponse = responseGenerator.generate(true,"please check your email id", 404 , null);
                res.send(myResponse);
            }
            else if (err) {
                var myResponse = responseGenerator.generate(true,"entered wrong email id", 404 , null);
                res.send(myResponse);
            }
            else{
               var transporter = nodemailer.createTransport({
                  service : "gmail",
                  //secure  : false,
                  //port    : 25,
                  auth: {
                    user: 'kota.raavi@gmail.com',
                    pass: 'nodejspassion'
                  }
                });
                var mailOptions = {
                  from: 'Ravi Kota <kota.raavi@gmail.com>',
                  to: foundUser.email,
                  subject: 'Sending Email using Node.js',
                  text: 'here is the required token by which you can reset your password and the same will be updated!'
                };
                transporter.sendMail(mailOptions, function(err, info){
                  if (err) {
                    console.log(err);
                    //var myResponse = responseGenerator.generate(true,"entered coming here wrong email id", 404 , null);
                    //res.send(myResponse);
                  } else {
                    console.log('Email sent: ' + info.response);
                    var myResponse = responseGenerator.generate(false,"check your modified inbox", 200 , info.response );
                    res.send(myResponse);
                  }
                });
                
            }
        });
    });// end forgetPassrword


// route for login using gmail

    passport.use(new GoogleStrategy({
      clientID:'681022953491-bsn1o15bb786oc68a459eg17u05i5jmk.apps.googleusercontent.com',
      clientSecret: 'UhBIHw8lEqy4Vnupk_S8vvOK',
      callbackURL: 'http://localhost:3000/auth/google/callback',
        passReqToCallback   : true
        },
        function(accessToken,refreshToken,profile,cb){
          process.nextTick(function(){
            return done(null,profile);
          });

        }));

    passport.serializeUser(function(user,cb){
      console.log(user);
      cb(null,user);
    });

    passport.deserializeUser(function(obj,cb){
      cb(null,obj);
    });


    app.use(require('morgan')('combined'));
    app.use(require('cookie-parser')());
    app.use(require('body-parser').urlencoded({ extended: true}));
    app.use(session({name :'myCustomCookie',secret: 'myAppSecret', resave: true,httpOnly : true,saveUninitialized: true,cookie: { secure: false }
    }));

    app.use(passport.initialize());
    app.use(passport.session());


    userRouter.get('/auth/google/callback',
  passport.authenticate('google',{scope: ['profile','email']}), function(req,res){
     
  });

  function ensureAuthenticated(req,res,next){
    if(req.isAuthenticated()){ return next();}
    res.redirect('/chatPlace');
  };

    app.use('/users', userRouter);
}