const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const router = require("../router/router.js");
const cors = require("cors");
const requestLogger = require("../middleware/requestLogger.js");
const { viewPosts } = require("../controller/post.js");

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

	app.get("/", async (req, res) => {
		res.clearCookie("token");
		const response = await viewPosts(req);
		return res.status(200).render("homepage", {
			total: response.total,
			totalPages: response.totalPages,
			currentPage: response.currentPage,
			posts: response.posts,
		});
	});    
	
	app.use((req, res) => res.status(404).render("404"));

	return app;
};

module.exports = server;