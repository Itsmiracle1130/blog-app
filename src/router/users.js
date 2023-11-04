const express = require("express");
const models = require("../models/model");
const { userSignup, userLogin, viewUser, logout } = require("../controller/user.js");
const {verifyToken} = require("../middleware/authenticate");

const router = express.Router();

router.get("/signup", (req, res) => {
	res.render("signup");
});

router.get("/login", (req, res) => {
	res.render("login");
});

router.get("/dashboard", verifyToken, async (req, res) => {
	const user = await models.user.findOne({ email: req.user.email }).select("-password");
	res.render("dashboard", ({
		user
	}));
});

router.post("/", userSignup);

router.post("/login", userLogin);

router.get("/:userId", viewUser);

router.get("/logout", logout);

module.exports = router;