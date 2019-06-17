//====================================
//		CAMPGROUND ROUTES
//====================================
var express = require("express");
var router	= express.Router();
var Camp 	=require("../models/Camp");
var middleware =	require("../middleware/index");

router.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})

//HOME PAGE
router.get("/", function(req, res){
	res.render("landing.ejs");
})
//PAGINATION TRIAL==================
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
//FORM TO ADD NEW CAMPGROUND
router.get("/campgrounds/new",middleware.isLoggedIn, function(req,res){
	res.render("camps/new.ejs")
})

//ADD NEWLY AADED CAMPGROUND TO DB AND DISPLAY ALL CAMPGROUNDS
router.post("/campgrounds/new",middleware.isLoggedIn, function(req, res){
	var newSite = req.body.newcamp;
	var newPhoto = req.body.image;
	var disc = req.body.disc;
	var addedBy = {id : req.user._id, username : req.user.username}
	var newCampsite = {name: newSite, image: newPhoto, disc : disc, addedBy: addedBy} 
	
	Camp.create(newCampsite, function(err,camps){
		if(err)
			console.log(err);
		else{
			console.log("User added new camp site  " +  newCampsite);
			res.redirect("/campgrounds");
		}
	} )
})
// EDIT CAMPGROUND IF AUTHENTICATED
router.get("/campgrounds/:id/edit", middleware.isOwner, function(req, res){
	Camp.findById(req.params.id, function(err, foundCamp){
		if(err)
			res.send("Error occured: " + err);
		else{
			res.render("camps/edit.ejs",{camp : foundCamp});
		}
	})

})
router.put("/campgrounds/:id", middleware.isOwner, function(req, res){
	Camp.findByIdAndUpdate(req.params.id, req.body.camp, function(err, data){
		if(err)
			res.send("<h2>Error:</h2>" + err);
		else
			res.redirect("/campgrounds/"+req.params.id);
	})
})
//DELETE CAMPGROUND
router.delete("/campgrounds/:id",middleware.isOwner, function(req, res){
	console.log("Inside delete function")
	Camp.findByIdAndRemove(req.params.id,  function(err){
		if(err)
			res.send("Error occured while deleting: "+ err);
		else{
			
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
		if(err)
			console.log(err);
	else{
			console.log("User selected.." + foundCamp );
			res.render("camps/show.ejs", {foundCamp: foundCamp})
		}
	})
});



module.exports = router;