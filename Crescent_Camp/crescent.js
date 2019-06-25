//Version 3.0			23/DEC/2018 NJ
//YELP CAMP SITE. WEB DEVELOPMENT BOOTCAMP BY COLT ON UDEMY.COM. 23 NOV 2018 NJ
//SITE TO DISPLAY CAMPGROUNDS AND USER CAN ADD NEW CAMPGROUNDS.

var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var mongoose = require("mongoose");
var flash = require("connect-flash");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");


var Camp = require("./models/Camp");
var User = require("./models/User");
var	campRoutes = require("./routes/camps");
var authRoutes = require("./routes/auth");

var app = express();

var nodemailer = require("nodemailer");
var crypto = require("crypto");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname+"/public"));
app.use(methodOverride("_method"));
app.use(flash());
app.use(require("express-session")({
	secret :"who knows!",
	resave : false,
	saveUninitialized :false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy (User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error=req.flash("error");
	//console.log("Crescent.js - ",res.locals.error);
	res.locals.success=req.flash("success");
	//console.log("Crescent.js -", res.locals.success);
	next();
})


app.use(campRoutes);
app.use(authRoutes);


//mongoose.connect("mongodb://localhost:32017/crescent_camp",{useNewUrlParser:true});
//mongoose.connect(process.env.DATABASEURL,{useNewUrlParser:true});

mongoose.connect(process.env.DATABASEURL, {
	useNewUrlParser:true,
	useCreateIndex:true
}).then(()=>{
	console.log("Connected to server");
}).catch(err =>{
	console.log(err);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, function(err){
	if(err)
		console.log("Can not run server");
	else
		console.log(`Server listening at PORT ${PORT} for Crescent campgrounds site...`);
})


