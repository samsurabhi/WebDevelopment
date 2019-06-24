
var mongoose = require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: {type:String, required:true, unique:true},
	email : {type:String, required: true, unique:true},
	password : String,
	resetPasswordToken : String,
	resetPasswordExpires : Date,
	hobbies : String,
});

var options = {
            MissingPasswordError: 'No password was given',
            AttemptTooSoonError: 'Account is currently locked. Try again later',
            TooManyAttemptsError: 'Account locked due to too many failed login attempts',
            NoSaltValueStoredError: 'Authentication not possible. No salt value stored',
            IncorrectPasswordError: 'Password or username are incorrect',
            IncorrectUsernameError: 'Password or username are incorrect',
            MissingUsernameError: 'No username was given',
            UserExistsError: 'A user with the given username is already registered'
            };



userSchema.plugin(passportLocalMongoose, options);
module.exports = mongoose.model("User", userSchema);