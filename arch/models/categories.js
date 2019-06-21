//CATEGORY SCHEMA DEFINITION AND EXPORTATION

var mongoose = require("mongoose");

var categorySchema = new mongoose.Schema({
	cateName: String,
	sampleImg: String,
	discription:String,
})

var Category = mongoose.model("Category", categorySchema);

module.exports = Category;