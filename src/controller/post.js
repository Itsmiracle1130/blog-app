const {validatePostData} = require("../validation/post");
const models = require("../models/model");
const { calculateReadTime } = require("../utility/readTime.js");
const logger = require("../utility/logger");
const post = require("../models/post");

const createPost = async(req, res) => {
	const username = req.user;

	try {
		const user = await models.user.findOne(username);
		const {error, value} = validatePostData(req.body);
		if (error) {
			res.status(400).send({
				status: false,
				message: "Invalid post"
			});
		}
		const createdPost = await models.post.create({
			title: value.title,
			description: value.description,
			body: value.body,
			tags: value.tags,
			author: user._id,
			reading_time: calculateReadTime(value.body)
		});
		// render views
		return res.status(201).render("dashboard")({
			status: true,
			message: "Post created",
			data: createdPost
		});
	} catch (error) {
		console.error("Error creating post");
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const viewOnePost = async(req, res) => {
	const { postId } = req.params;

	try {
		const post = await models.post.findOne({ _id: postId }, { state: "published"});
		if (!post) {
			return res.status(404).json({
				status: false,
				message: "Post not found"
			});
		}
		if (post.deleted) {
			return res.status(204).json({
				status: false,
				message: "Invalid Post Id"
			});
		}
		// render
		return res.status(200).render("...", ({
			post, postId
		}));
	} catch (error) {
		logger.error(`Error reading blog: ${error.message}`);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const viewPosts = async(req, res) => {
	let { page, limit, order, orderBy, search } = req.query;

	try {
		page = page || 1;
		limit = limit || 15;

		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
  
		let query = {};

		if (search) {
			query.$or = [
				{ title: { $regex: search, $options: "i" } },
				{ author: { $regex: search, $options: "i" } },
				{ tags: { $regex: search, $options: "i" } },
			];
		}

		let sort = {};
		if (order && orderBy) {
			if (orderBy === "readCount" || orderBy === "readTime" || orderBy === "timestamp") {
				sort[orderBy] = order === "asc" ? 1 : -1;
			}
		}
		
		

		const post = await models.post.find(query)
			.sort(sort)
			.limit(endIndex)
			.skip(startIndex)
			.exec();
		
		if (post.length < 1) {
			return res.status(204).send({
				status: true,
				message: "No data"
			});
		}

		const count = await models.post.countDocuu(query);	
		const totalPages = Math.ceil(count / limit);
		const total = post.length;
		
		// render views
		return res.status(200).json({
			status: true,
			message: "",
			data: {
				total,
				totalPages,
				currentPage: page,
				post
			}
		});
        
	} catch (error) {
		console.error("Error reading task", error.message);
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const viewAllPostsById = async (req, res) => {
	try {
		const { postId } = req.params;
		const post = await models.post.findOne({ _id: postId }, { state: "published"});
		if (!post) {
			return res.status(404).json({
				status: false,
				message: "Post not found"
			});
		}
		post.readCount += 1;
		const result = await post.save();
		return res.status(200).json({
			status: true,
			message: "post fetched successfully",
			data: result
		});
	} catch (error) {
		console.error("Error reading task", error.message);
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const updatePost = async (req, res) => {
	try {
		const { id } = req.user;
		const { postId } = req.params;
		const post = await models.post.findOne({ _id: postId }, { state: "published"});

		if (!post) {
			return res.status(404).json({
				status: false,
				message: "Post not found"
			});
		}
	  	if (post.user_id.toString() != id) {
	  		return res.status(401).send({
				status: false,
				message: "Unauthorized user"
			});
	  	}
		post.state = "published";
	
		const result = await post.save();
		return res.status(200).json({
			status: true,
			message: "Update successful",
			data: result
		});
	} catch (error) {
		console.error("Error reading task", error.message);
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const deletePost = async (req, res) => {
	try {
		const { id } = req.user;
		const { postId } = req.params;
		const post = await models.post.findOne({ _id: postId });
		if (!post) {
			return res.status(404).json({
				status: false,
				message: "Post not found"
			});
		}
		if (post.user_id.toString() != id) {
			return res.status(401).send({
				status: false,
				message: "Unauthorized user"
			});
		}
		const deletedPost = await post.findByIdAndDelete(post);
		return res.status(200).json({
			status: true,
			message: "Post deleted successfully",
			data: postId
		});
	
	} catch (error) {
		console.error(error.message);
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

module.exports = {
	createPost, viewOnePost, viewPosts, viewAllPostsById, updatePost, deletePost
};

