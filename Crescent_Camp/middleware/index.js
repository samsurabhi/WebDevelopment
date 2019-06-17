

var Camp = require("../models/Camp");
var User = require("../models/User");

var middlewareObj = {};


middlewareObj.isLoggedIn =function(req, res, next){
	if(req.isAuthenticated()){
		return next();
	}
	else{
		req.flash("error","You need to login to do that!!!");
		res.redirect("/login");
	}
}
middlewareObj.isOwner = function(req, res, next){
	if(req.isAuthenticated()){
		Camp.findById(req.params.id, function(err, camp){
			if(err){
				res.flash("error", "Campground not found!")
				res.redirect("/login");
			}
			else{ 
				if(camp.addedBy.id.equals(req.user._id))
				 	next();
				 else{
				 	res.flash("error", "You do not have permission to do that!!!")
				 	res.redirect("back");
				}
			}
		})
	}
}

module.exports = middlewareObj;