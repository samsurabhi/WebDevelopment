var mongoose = require("mongoose");

var trailsSchema = new mongoose.Schema({
			trail_name:String,
			info:String,
			dist: String,
			expect: String,
			photo_link: String,
			enjoyed: String
		});


//var trails = mongoose.model("Trail", trailsSchema);
var campSchema = new mongoose.Schema({
	name:{type:String, required:true},
	image:String,
	recommend: String,
	disc :{type:String, required:true},
	experience: String,
	site_link: String,
	map_link: String,
	trails:[trailsSchema],
	addedBy :{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref : "User"
		},
		username: String,	
	}
});


module.exports = mongoose.model("Camp", campSchema);