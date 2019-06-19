var mongoose = require("mongoose");

var contactSchema = {
	username : {type:String, required:true},
	email:{type:String, required:true},
	phone:{type:Number},
	subject:String,
	question:String
}

module.exports = mongoose.model("Contact", contactSchema);