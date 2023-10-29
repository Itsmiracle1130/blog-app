const express = require("express");
const userRoute = require("./users.js");

const router = express.Router();

router.use("/users", userRoute);

module.exports = router;