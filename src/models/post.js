const mongoose = require("mongoose");

const schema = mongoose.Schema;

const postModel = new schema ({
	title: {
		type: String,
		required: true
	},
	description: {
		type: String,
		required: true
	},
	body: {
		type: String,
		required: true
	},
	state: {
		type: String,
		enum: ["draft", "published"],
		default: "draft"
	},
	readCount: {
		type: Number,
		default: 0
	},
	readingTime: {
		type: String
	},
	tags: {
		type: [String]
	}, 
	author: {
		type: String,
		required: true
	},
	deleted: {
		type: Boolean,
		default: false
	}
}, {timestamps: true});

module.exports = mongoose.model("post", postModel);