const express = require("express");
const { userSignup, userLogin, viewUser, logout } = require("../controller/user.js");

const router = express.Router();

router.get("/", (req, res) => {
	res.render("signup");
});

router.get("/login", (req, res) => {
	res.render("login");
});

router.get("/dashboard", (req, res) => {
	res.render("dashboard");
});

router.post("/signup", userSignup);

router.post("/login", userLogin);

router.get("/userId", viewUser);

router.get("/logout", logout);

module.exports = router;