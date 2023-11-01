const express = require("express");
const userRoute = require("./users.js");
const postRoute = require("./posts.js");

const router = express.Router();

router.use("/users", userRoute);
router.use("/posts", postRoute);

module.exports = router;