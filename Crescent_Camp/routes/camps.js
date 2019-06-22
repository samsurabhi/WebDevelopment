//====================================
//		CAMPGROUND ROUTES
//====================================
var express = require("express");
var router	= express.Router();
var Camp 	=require("../models/Camp");
var middleware =	require("../middleware/index");

var async = require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");
var Contact = require("../models/Contact");

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})

//HOME PAGE
router.get("/", function(req, res){
	res.render("landing.ejs");
})
//DISPLAY ALL CAMPGROUNDS WITH PAGINATION
router.get("/campgrounds", function(req, res, next){
	var pageQuery = parseInt(req.query.page);
	var page = pageQuery ? pageQuery : 1;
	var perPage = 4 ;
	Camp.find({})
		.skip((perPage * page) - perPage)
		.limit(perPage)
		.exec(function(err, campgrounds){
			Camp.countDocuments().exec(function(err, count){
				if(err) return next(err)
				res.render("camps/campgrounds.ejs",{
					campgrounds:campgrounds,
					current : page,
					pages : Math.ceil(count/perPage) 
				})	
			})
		})

})
//ABOUT THE SITE 
router.get("/campgrounds/about", function(req, res){
	res.render("camps/about.ejs");
})

//CONTACT US 
router.get("/campgrounds/contact", function(req,res){
	res.render("camps/contact.ejs");
})

router.post("/campgrounds/contact", function(req, res,next){
	console.log("Inside post contact")
	
		function hi(){
			var smtpTransport = nodemailer.createTransport({
				service:"Gmail",
				auth:{
					user:"nahakmohak@gmail.com",
					pass:process.env.GMAILPW
				}
			});

			var mailOptions = {
				to: "surabhi.mirajkar@gmail.com",
				from: req.body.email,
				subject: req.body.subject,
				text: req.body.question
			}
			smtpTransport.sendMail(mailOptions,function(err){
				console.log("Error sending mail",err);
				next();
			})
		}
		hi();
	res.redirect("/campgrounds");
})

var trail = [];
var campsite = {} ;
var flag = 1;
//FORM TO ADD NEW CAMPGROUND
router.get("/campgrounds/new",middleware.isLoggedIn, function(req,res){
	res.render("camps/new.ejs",{flag:flag})
})


//ADD NEWLY ADDED CAMPGROUND TO DB AND DISPLAY ALL CAMPGROUNDS
 router.post("/campgrounds/new",middleware.isLoggedIn, function(req, res){
	var new_trail = {
				trail_name:req.body.trail_name,
				dist:req.body.dist,
				expect:req.body.expect,
				info:req.body.info,
				photo_link:req.body.photo_link
			};
	trail.push(new_trail);		
	if (flag==1){
		campsite = {
 			name: req.body.newcamp,
			image: req.body.image,
			disc : req.body.disc,
			experience:req.body.experience,
			site_link: req.body.site_link,
			map_link: req.body.map_link,
			recommend: req.body.recommend,
			
			addedBy: {id : req.user._id, username : req.user.username}
 		};
 		flag=0;
	}	
	else{

 	}
 	if(req.body.more_trails=="YES"){
 		res.render("camps/new.ejs",{flag:flag});
	}
	else{	
			var newCamp = new Camp(campsite);
			trail.forEach(function(t){
				newCamp.trails.push(t);
			});
	 		
		 	newCamp.save(function(err, camp){
		 		flag = 1;
	 		if(err){
	 			req.flash("error","Please add campsite name!")
				console.log(err);
	 		}
			else{
				console.log("User added new camp site  " +  camp.name);
				req.flash("success", "Your awesome campsite has been added!!!")
				res.redirect("/campgrounds");
			}
 		});
 	}
 });


// EDIT CAMPGROUND IF AUTHENTICATED
router.get("/campgrounds/:id/edit", middleware.isOwner, function(req, res){
	Camp.findById(req.params.id, function(err, foundCamp){
		if(err){
			console.log("No campground found by findById() at edit route.")
			res.send("Error occured: " + err);
		}
		else{
			res.render("camps/edit.ejs",{camp : foundCamp});
		}
	})

})
router.put("/campgrounds/:id", middleware.isOwner, function(req, res){
	Camp.findByIdAndUpdate(req.params.id, req.body.camp, function(err, data){
		if(err){
			req.flash("error", "Error occured while updating!!!");
			console.log("Error while updating ==>>", err);
			res.redirect("/campgrounds/req.params.id/edit");
		}
		else{
			req.flash("success", "Campsite updated successfully!!!")
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
})

//EDIT TRAIL
router.get("/campgrounds/:id/edit/:trail_id", middleware.isOwner, function(req, res){
	Camp.findOne({_id:req.params.id,'trails._id':req.params.trail_id},{'trails.$':1}, function(err,camp){
		if(err){
			res.send("Error",err);
		}
		else{
			console.log(camp)	;
			res.render("camps/edit_trail.ejs",{camp:camp});
		}
	})
})

//PUT /UPDATE TRAIL
router.put("/campgrounds/:id/trail/:trail_id", middleware.isOwner, function(req, res){
	Camp.findOneAndUpdate({_id:req.params.id,'trails._id':req.params.trail_id}, 
		{$set:{'trails.$.trail_name':req.body.trail_name,
				'trails.$.dist':req.body.dist,
				'trails.$.expect':req.body.expect,
				'trails.$.info':req.body.info,
				'trails.$.photo_link':req.body.photo_link
			}}, function(err, data){
		if(err){
			res.send("Error updating trail");
		}
		else{
			req.flash("success","Trail updated!");
			console.log("Trail updated");
			res.redirect("/campgrounds/"+req.params.id);
		}
	})
	
})

//DELETE CAMPGROUND
router.delete("/campgrounds/:id",middleware.isOwner, function(req, res){
	console.log("Inside delete function")
	Camp.findByIdAndRemove(req.params.id,  function(err){
		if(err)
			res.send("Error occured while deleting: "+ err);
		else{
			req.flash("success", "Campground deleted!!!")
			res.redirect("/campgrounds");
		}
	})
})

//DELETE TRAIL
router.delete("/campgrounds/:id/trail/:trail_id", middleware.isOwner, function(req, res){
	Camp.findOneAndUpdate({_id:req.params.id},
		{
			$pull:{trails:{_id:req.params.trail_id}}

		}, function(err){
		if(err){
			res.send("Error while deleting");
			console.log(err);
		}else{

			req.flash("success", "Trail deleted!");
			res.redirect("/campgrounds");
		}
	})
})


//****************will not go here ..as it will go to campgrounds/:page !!!
// SHOW DETAIL INFO ABOUT SELECTED CAMPGROUND
router.get("/campgrounds/:id", function(req,res){
	var id = req.params.id;
	Camp.findById(id, function(err, foundCamp)
		{
		if(err){
			req.flash("error", "Campground not found or Error occured!!!")
			console.log(err);
			res.redirect("/campgrounds");
		}
	else{
			console.log("User selected.." + foundCamp.name );
			res.render("camps/show.ejs", {foundCamp: foundCamp})
		}
	})
});


module.exports = router;