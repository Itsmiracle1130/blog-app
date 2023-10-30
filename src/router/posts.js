const express = require("express");
const {createPost, viewOnePost, viewPosts, viewAllPostsById, updatePost, deletePost} = require("../controller/post.js");
const {verifyToken} = require("../middleware/authenticate.js");

const router = express.Router();

router.post("/", verifyToken, createPost, viewPosts);

router.get("/", viewAllPostsById);

router.get("/posts", (req, res) => {
	res.render("homepage");
});

router.get("/:postId", viewOnePost);

router.get("/update/:postId", updatePost);

router.post("/update/:postId", updatePost);

router.get("/delete/:postId", deletePost);

module.exports = router;