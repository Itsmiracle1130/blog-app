const express = require("express");
const {createPost, viewOnePost, viewPosts, updatePost, deletePost, ownerPost, readOwnerSinglePost, updatePrefill} = require("../controller/post.js");
const {verifyToken} = require("../middleware/authenticate.js");
const { splitTags } = require("../utility/readTime.js");

const router = express.Router();

router.post("/", verifyToken, splitTags, createPost);

router.get("/create", (req, res) => {
	res.render("createPost");
});

router.get("/", async (req, res) => {
	try {
		const response = await viewPosts(req);
		return res.status(200).render("viewPosts", ({
			total: response.total,
			totalPages: response.totalPages,
			currentPage: response.currentPage,
			posts: response.posts,
		}));
	} catch (error) {
		return res.status(500).json({
			status: false,
			message: "Internal server error",
		});
	}
});

router.get("/:postId", viewOnePost);

router.get("/owner/author", verifyToken, ownerPost);

router.get("/owner/author/:postId", verifyToken, readOwnerSinglePost);

router.get("/update/:postId", verifyToken, updatePrefill);

router.post("/update/:postId", verifyToken, updatePost);

router.get("/delete/:postId", verifyToken, deletePost);

module.exports = router;