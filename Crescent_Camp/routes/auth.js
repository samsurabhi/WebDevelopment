//--------------------------------------------------------------//
//  AUTHENTICATION ROUTES//
//--------------------------------------------------------------//

var express = require("express");
var passport = require("passport");
var	User 	= require("../models/User");
var router	= express.Router();
var nodemailer = require("nodemailer");
var async = require("async");
var crypto = require("crypto");
//--------------------------------------------------------------//
//REGISTER
router.get("/register", function(req, res){
	res.render("auth/register.ejs");
});

router.post("/register", function(req, res){
	var newUser = new User({username:req.body.username, email:req.body.email, hobbies:req.body.hobbies});
	User.register(newUser, req.body.password, function(err, user){
		if(err){
			req.flash("error", err+" Error while registering");
			res.redirect("/register");  
			
		}
			passport.authenticate("local") (req, res, function(){
			req.flash("success", "Welcome to Crescent Campgrounds!");
			res.redirect("/campgrounds");

		})
	})
})	


//--------------------------------------------------------------//
//LOGIN
router.get("/login", function(req, res){
	res.render("auth/login.ejs");
})


router.post("/login", passport.authenticate("local", { failureRedirect:"/login", failureFlash:true}),
	function(req, res){
		req.flash("success","Sucessfully logged you in. Welcome to Crescent Campgrounds!!!");
		res.redirect("/campgrounds");

})
//LOGOUT
router.get("/logout", function(req, res){
	req.logout();
	req.flash("success","Sucessfully logged you out.");
	res.redirect("/campgrounds");
})
//---------------------------------------------------------------//
//FORGOT PASSWORD ROUTES
router.get("/forgot", function(req,res){
	res.render("auth/forgot.ejs");
})

router.post("/forgot", function(req,res, next){
	console.log("inside post forgot route");
	async.waterfall([
		function(done){
			crypto.randomBytes(20, function(err, buf){
				const token = buf.toString('hex');
				done(err, token);
			});
		},

		function(token, done){
			User.findOne({email:req.body.email}, function(err, user){
				if(!user){
					req.flash('error',err);
					return res.redirect("/forgot");
				}
				user.resetPasswordToken=token;
				user.resetPasswordExpires=Date.now() + 3600000;
				user.save(function(err){
					done(err,token, user);
				});
			});
		},

		function(token, user, done){
			var smtpTransport = nodemailer.createTransport({
				service : "Gmail",
				auth : {
					user : "nahakmohak@gmail.com",
					pass : process.env.GMAILPW
				}
			});
			var mailOptions = {
				to : user.email,
				from : 'nahakmohak@gmail.com',
				subject : "Password reset mail from Crescent Campgrounds",
				text : "Hello "+user.username+"\n\n Click the link given to reset your password:\n\n 'http://"+req.headers.host+"/reset/"+token+"\n\n This is an auto generated mail."
			};
			smtpTransport.sendMail(mailOptions, function(err){
				console.log("mail sent");
				req.flash("success","Mail to reset your password has been sent. Please check your mailbox.");
				done(err, 'done');
			});
		}
	]), function(err){
		if(err){
			return next(err);
		}
	console.log("Mail to reset your password has been sent. Please check your mailbox")	;
	res.flash("success", "Mail to reset your password has been sent. Please check your mailbox");
	res.redirect("/campgrounds")	;	
	}
})
//RESET PASSWORD GET ROUTE
router.get("/reset/:token", function(req,res){
	User.findOne({resetPasswordToken:req.params.token, resetPasswordExpires:{$gt:Date.now()}},
		function(err, user){
			if(!user){
				req.flash('error', 'Token invalid or Token has already been expired. Please try again.');
				return res.redirect('/forgot');
			}
			res.render("auth/reset.ejs", {token:req.params.token});
		});
});

//RESET PASSWORD POST ROUTE
router.post("/reset/:token", function(req, res){
	async.waterfall([
		function(done){
			User.findOne({resetPasswordToken:req.params.token, resetPasswordExpires:{$gt:Date.now()}},
				function(err, user){
					if(!user){
						req.flash("error", "Token invalid or Token expired!!!");
						return res.redirect("back");
					}
					if(req.params.password===req.params.confirm){
						user.setPassword(req.body.password, function(err){
							user.resetPasswordToken = undefined;
							user.resetPasswordExpires = undefined;
							user.save(function(err){
								req.logIn(user, function(err){
									done(err, user);
								})
							})
						})
					} else{
						req.flash("error", "Passwords do not match. Please try again!!!");
						return res.redirect("back");
					}
				});
		}, 

		function(user, done){
			var smtpTransport = nodemailer.createTransport({
				service : "Gmail",
				auth : {
					user:"nahakmohak@gmail.com",
					pass:process.env.GMAILPW
				}
			});
			var mailOptions = {
				to : user.email,
				from : 'nahakmohak@gmail.com',
				subject : 'Password reset confirmation mail from Crescent Campgrounds!',
				text :"Hello "+ user.username + "\n\n Your password has been reset sucessfully.\n\n Thanks\n\n\n This is an auto generated email."
			};
			smtpTransport.sendMail(mailOptions, function(err){
				req.flash("success", "Your password has been reset!!!");
				done(err);
			});
		}
	], function(err){
		res.redirect('/campgrounds');
	});
});


//--------------------------------------------------------------//
module.exports = router;
//--------------------------------------------------------------//
