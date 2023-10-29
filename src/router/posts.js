const express = require("express");
const {createPost, viewOnePost, viewPosts, viewAllPostsById, updatePost, deletePost} = require("../controller/post.js");

const router = express.Router();

router.post("/", createPost, viewPosts);

router.get("/", viewAllPostsById);

router.get("/post", (req, res) => {
	res.render("homepage");
});

router.get("/update/:postId", updatePost);

router.get("/:postId", viewOnePost);

router.post("/update/:postId", updatePost);

router.get("/delete/:postId", deletePost);

module.exports = router;