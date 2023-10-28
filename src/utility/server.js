const express = require("express");
// const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const router = require("../router/routers.js");
const cors = require("cors");

const server = () => {
	const app = express();
	app.use(express.json());
	// const viewsPath = path.join(__dirname, "../views");
	// app.set("views", viewsPath);
	// app.set("view engine", "ejs");

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());

	app.use(cors());

	app.get("/", (req, res) => {
		// res.clearCookie("token");
		// res.render("homepage");
	});
    
	// app.use("/", router);
	
	app.use((req, res) => res.status(404).json({}))

	return app;
};

module.exports = server;