const mongoose = require("mongoose");
require("dotenv").config();

const DB_URL = process.env.DB_URL;

function database() {
	mongoose.connect(DB_URL);

	mongoose.connection.on("connected", () => {
		console.log("Successfully connected to Mongodb");
	});

	mongoose.connection.on("error", (error) => {
		console.log(error);
		console.log("Error connecting to Mongodb")
	});
}

module.exports = {database};