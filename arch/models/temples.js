//TEMPLE SCHEMA DEFINITION AND EXPORTATION

var mongoose = require("mongoose");

var templeSchema = new mongoose.Schema({
	category:String,
	name:String,
	location:String,
	images:String,
	arch_type:String,
	builtIn: Number,
	speciality:String,
	mainFestival:String,
})

var Temple = mongoose.model("Temple", templeSchema);
module.exports = Temple;

