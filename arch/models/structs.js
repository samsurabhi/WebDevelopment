//STRUCTURE SCHEMA DEFINITION AND EXPORTATION

var mongoose = require("mongoose");

var StructSchema = new mongoose.Schema({
	category:String,
	name:String,
	location:String,
	images:String,
	arch_type:String,
	builtIn: String,
	speciality:String,
	mainFestival:String,
})

var Struct = mongoose.model("Struct", StructSchema);
module.exports = Struct;

