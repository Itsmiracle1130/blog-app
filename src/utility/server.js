const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("../router/router.js");
const cors = require("cors");
const requestLogger = require("../middleware/requestLogger.js");

const server = () => {
	const app = express();
	app.use(express.json());
	const viewsPath = path.join(__dirname, "../views");
	app.set("views", viewsPath);
	app.set("view engine", "ejs");

	app.use(cookieParser());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use("/", requestLogger);

	app.use(cors());
	
	app.use("/", router);

	app.get("/", (req, res) => {
		res.clearCookie("token");
		res.render("homepage");
	});    
	
	app.use((req, res) => res.status(404).render("404"));

	return app;
};

module.exports = server;