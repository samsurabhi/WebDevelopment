var mongoose = require("mongoose");

var campSchema = new mongoose.Schema({
	name:{type:String, required:true},
	image:String,
	recommend: String,
	disc :{type:String, required:true},
	experience: String,
	site_link: String,
	map_link: String,
	trails:[{
			trail_name:String,
			info:String,
			dist: String,
			expect: String,
			photo_link: String,
			enjoyed: String
		}],
	addedBy :{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref : "User"
		},
		username: String,	
	}
});


module.exports = mongoose.model("Camp", campSchema);