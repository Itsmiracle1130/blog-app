const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userModel = new Schema({
	firstName: {
		type: String,
		required: true
	},
	lastName: {
		type: String,
		required: true
	},
	email: {
		type: String,
		required: true
	},
	username: {
		type: String,
		unique: true,
		lowercase: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
}, {timestamps: true});

module.exports = mongoose.model("user", userModel);