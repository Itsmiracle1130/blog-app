const express = require("express");
const { userSignup, userLogin, logout } = require("../controller/user.js");

const router = express.Router();

router.post("/", userSignup);
router.post("/login", userLogin);

router.get("/logout", logout);

module.exports = router;