// WEBSITE WITH TWO COLLECTIONS --> CATEGORIES AND TEMPLES 
//MAIN INDEX PAGE WILL SHOW ALL CATEGORIES

var express = require("express");
	mongoose = require("mongoose");
	bodyParser = require("body-parser");
	ejs = require("ejs");
	methodOverride = require("method-override");
	flash = require("connect-flash");

var app = express();

app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(flash());
app.use(bodyParser.urlencoded({extended:true}));
app.use(require("express-session")({
	secret :"who knows!",
	resave : false,
	saveUninitialized :false
}));


app.use(express.static(__dirname+"/public"));
app.use(function(req,res,next){
	res.locals.message = req.flash("message");
	next();
})


mongoose.connect("mongodb://localhost:32017/temples",{useNewUrlParser:true});

//DEFINE SCHEMAS FOR CATEGORIES AND PLACES IN MODELS DIR AND GET THEM HERE

var Category = require("./models/categories");
var Temple = require("./models/temples");

//DEFINE HOME PAGE FUNCTION
app.get("/", function(req,res){
	res.redirect("/index");
})
//INDEX PAGE SHOWING ALL CATEGORIES
app.get("/index", function(req,res){
	Category.find({}, function(err, categories){
		if(err)
			console.log(err);
		else
			res.render("index", {categories:categories})
	})
})
//=========================================================================================//
//ADD NEW CATEGORY
app.get("/index/new", function(req, res){
	res.render("new");
})

//INSERT NEW CATEGORY INTO COLLECTION
app.post("/index", function(req, res){
	Category.create(req.body.category, function(err, data){
		if(err)
			console.log(err)
		else{
			req.flash("message","Added New Category")
			res.redirect("/index")
		}
	})
})

//DELETE CATEGORY AND ALL ASSOCIATED PLACES
app.delete("/index/:id/delete", function(req, res){
	Temple.remove({category:req.body.cateName}, function(err){
		Category.findByIdAndRemove(req.params.id, function(err){
			if(err){
					req.flash('message', "Error while deleting. Could not delete.");
					res.redirect("/index");
				}
				else{
					req.flash('message',"Deleted category.");
					res.redirect("/index");
					}
				})
			})
		})	


//=========================================================================================//
//ADD NEW TEMPLE INTO CATEGORY --DISPLAY FORM 
app.get("/index/new_temple", function(req, res){
	Category.find({}, function(err, data){
		if(err)
			console.log(err)
		else
			res.render("new_temple", {categories:data});
	})
	
})
//ADD DATA FROM FORM TO TEMPLE  COLLECTION
app.post("/index/new_temple", function(req, res){
	Temple.create(req.body.temple, function(err, data){
		if(err)
			console.log(err)
		else{
			req.flash("message","Added New Place.")
			res.redirect("/index");
		}
	})
})
//=========================================================================================//

//SHOW PAGE SHOWING DEATILS OF SPECIFIC CATEGORY, GET ID, FINDBYID, PASS FOUND, SHOWS LIST OF PLACES IN THAT CATEGORY

app.get("/index/:id", function(req, res){
	Category.findById(req.params.id, function(err, data){
		if(err)
			console.log(err)
		else{
			var selectedCate = data.cateName;
			Temple.find({category:selectedCate}, function(err, selectedCate){
				if(err)
					console.log(err)
				else
					res.render("show", {category: data, selectedCate: selectedCate});	
			})
			
		}
	})
	
})

//=========================================================================================//
//EDIT CATEGORY --SHOWS PREPOPULATED FORM TO BE SUBMITTED, GET ID, PASS IT, USE IT IN FORM
app.get("/index/:id/edit", function(req, res){
	var editMe = req.params.id;
	Category.findById(editMe, function(err, editMe){
		if(err)
			console.log(err)
		else
			res.render("edit",{category:editMe})
	})
	
})


//UPDATE CATEGORY PUT/POST METHODS , FIND BY ID AND UPDATE , CREATE, REDIRECT TO INDEX/SHOW
app.put("/index/:id", function(req, res){
	Category.findByIdAndUpdate(req.params.id, req.body.category, function(err, data){
		if(err){
			req.flash("message","Error while updating. Could not update.");
			console.log(err)
		}
		else{
			req.flash("message","Updated Category.");
			res.redirect("/index/" + req.params.id);
		}
	})
})
//=========================================================================================//
//SHOW SELECTED TEMPLE
app.get("/index/:id/show_temple", function(req,res){
	var showMe = req.params.id;
	Temple.findById(showMe, function(err, temple){
		if(err){
			console.log(err);
			req.flash("message","Error occured");
			res.redirect("/index");
			
		}
		else
			res.render("show_temple",{temple:temple} );
	})

})


//=========================================================================================//
//EDIT TEMPLE -- SHOWS FORM TO BE EDITED
app.get("/index/:id/edit_temple", function(req,res){
	var editMe = req.params.id;
	Temple.findById(editMe, function(err, data){
		if(err)
			console.log(err);
		else
			res.render("edit_temple", {editMe: data})
	})
	
})

//UPDATE TEMPLE
app.put("/index/:id/edit_temple", function(req,res){
	var editedMe = req.params.id;
	console.log("Temple to edit:" + editedMe)
	Temple.findByIdAndUpdate(req.params.id, req.body.temple, function(err, edited){
		if(err){
			req.flash("message","Error while updating structure");
			console.log(err);
			res.redirect("/index/");
		}
		else{
			req.flash("message","Updated place information.")
			res.redirect("/index/" + req.params.id + "/show_temple");
		}
	})
})



//=========================================================================================//
//DELETE TEMPLE
app.delete("/index/:id", function(req, res){
	Temple.findByIdAndRemove(req.params.id, req.body.temple, function(err){
		if(err)
			console.log(err)
		else{
			req.flash("message","Deleted Place");
			res.redirect("/index");

		}
	})

})


//START NODE SERVER
const PORT = process.env.PORT || 3005;
app.listen(PORT, function(err){
	console.log(`Server listening at PORT ${PORT} for ancient architectures site ...`);
})
