var mongoose = require("mongoose");

var campSchema = new mongoose.Schema({
	name:String,
	image:String,
	disc : String,
	addedBy :{
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref : "User"
		},
		username: String,	
	}
});


module.exports = mongoose.model("Camp", campSchema);