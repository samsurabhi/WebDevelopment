//ANCIENT ARCHITECTURES WEBSITE   
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

const DATABASEURL = process.env.ARCH_DATABASEURL;
mongoose.connect(DATABASEURL, {useNewUrlParser:true});


//DEFINE SCHEMAS FOR CATEGORIES AND PLACES IN MODELS DIR AND GET THEM HERE

var Category = require("./models/categories");
var Struct = require("./models/structs");

//DEFINE HOME PAGE FUNCTION
app.get("/", function(req,res){
	res.redirect("/index");
})
//INDEX PAGE SHOWING ALL CATEGORIES
app.get("/index", function(req,res){
	var search = req.query.search;
	if (search == undefined){
		search = {};
	} else {
		search = {cateName:{$regex:search, $options: "ig"}}
	}
	Category.find(search, function(err, categories){
		if(err)
			console.log(err);
		else{
			res.render("index", {categories:categories})
		}
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
//============================================================================================//
//SHOW PAGE SHOWING DEATILS OF SPECIFIC CATEGORY, GET ID, FINDBYID, PASS FOUND, SHOWS LIST OF PLACES IN THAT CATEGORY
app.get("/index/:id", function(req, res){
	Category.findById(req.params.id, function(err, data){
		if(err)
			console.log(err)
		else{
			var selectedCate = data.cateName;
			Struct.find({category:{$in:[selectedCate]}}, function(err, selectedCate){
				if(err)
					console.log(err)
				else{
					res.render("show", {category: data, selectedCate: selectedCate});	
				}
			})
			
		}
	})
	
})

//=========================================================================================//
//EDIT/UPDATE CATEGORY --SHOWS PREPOPULATED FORM TO BE SUBMITTED, GET ID, PASS IT, USE IT IN FORM
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

//==========================================================================================//
//DELETE CATEGORY AND ALL ASSOCIATED PLACES
app.delete("/index/:id", function(req, res){
	Struct.remove({category:req.body.cateName}, function(err){
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
//			STRUCTURE ROUTES
//=========================================================================================//

//ADD NEW STRUCT INTO CATEGORY --DISPLAY FORM 
app.get("/struct/new", function(req, res){
	Category.find({}, function(err, data){
		if(err)
			console.log(err)
		else
			res.render("new_struct", {categories:data});
	})
	
})
//ADD DATA FROM FORM TO STRUCT  COLLECTION
app.post("/struct", function(req, res){
	Struct.create(req.body.struct, function(err, data){
		if(err)
			console.log(err)
		else{
			req.flash("message","Added New Place.")
			res.redirect("/index");
		}
	})
})

//=========================================================================================//
//SHOW SELECTED STRUCT
app.get("/struct/:id", function(req,res){
	var showMe = req.params.id;
	Struct.findById(showMe, function(err, struct){
		if(err){
			console.log(err);
			req.flash("message","Error occured");
			res.redirect("/index");
			
		}
		else
			res.render("show_struct",{struct:struct} );
	})

})
//=========================================================================================//
//EDIT STRUCT -- SHOWS FORM TO BE EDITED
app.get("/struct/:id/edit", function(req,res){
	var editMe = req.params.id;
	Struct.findById(editMe, function(err, data){
		if(err)
			console.log(err);
		else
			res.render("edit_struct", {editMe: data})
	})
	
})

//UPDATE STRUCT
app.put("/struct/:id", function(req,res){
	var editedMe = req.params.id;
	Struct.findByIdAndUpdate(req.params.id, req.body.struct, function(err, edited){
		if(err){
			req.flash("message","Error while updating structure");
			console.log(err);
			res.redirect("/index/");
		}
		else{
			req.flash("message","Updated place information.")
			res.redirect("/struct/" + req.params.id );
		}
	})
})

//=========================================================================================//
//DELETE STRUCT
app.delete("/struct/:id", function(req, res){
	Struct.findByIdAndRemove(req.params.id, req.body.struct, function(err){
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
