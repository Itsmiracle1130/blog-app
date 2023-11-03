const {validatePostData} = require("../validation/post");
const models = require("../models/model");
const { calculateReadTime } = require("../utility/readTime.js");
const logger = require("../utility/logger");

const createPost = async(req, res) => {
	const {username} = req.user;

	try {
		const user = await models.user.findOne({username});
		const {error, value} = validatePostData(req.body);
		if (error) {
			res.status(400).send({
				status: false,
				message: error.message
			});
		}
		const post = await models.post.create({
			title: value.title,
			description: value.description,
			body: value.body,
			tags: value.tags,
			author: username,
			readingTime: calculateReadTime(value.body)
		}); 
		// user.posts.push(post._id);
		user.save();
		post.readCount += 1;

		await post.save();
		return res.status(201).render("viewPost", ({
			post, user, postId: post._id
		}));
	} catch (error) {
		console.error("Error creating post", error);
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const viewOnePost = async(req, res) => {
	const { postId } = req.params;

	try {
		const post = await models.post.findById(postId);
		if (!post || post.state === "draft") {
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

		post.readCount += 1;
		await post.save();

		return res.status(200).render("viewPost", ({
			post, postId, author: post.author
		}));
	} catch (error) {
		logger.error(`Error reading post: ${error.message}`);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const viewPosts = async (req) => {	
	let { page, limit, search, order, orderBy } = req.query;
	page = page || 1;
	limit = limit || 20;
	
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;
	
	let query = { state: "published", deleted: false };
	
	if (search) {
		const searchRegex = new RegExp(search, "i");
		query.$or = [
			{ title: { $regex: searchRegex } },
			{ author: { $regex: searchRegex } },
			{ tags: { $elemMatch: { $regex: searchRegex } } } 
		];
	}
  
	let sort = {};
	if (order && orderBy) {
		if (orderBy === "read_count" || orderBy === "reading_time" || orderBy === "timestamp") {
			sort[orderBy] = order === "asc" ? 1 : -1;
		}
	}
	
	const posts = await models.post.find(query)
		.sort(sort)
		.limit(endIndex)
		.skip(startIndex)
		.exec();
	// console.log("hi there", posts); 
	if (posts.length < 1) {
		return {
			status: true,
			message: "No content",
		};
	}
	
	const count = await models.post.countDocuments(query);
	
	const totalPages = Math.ceil(count / limit);
	const total = posts.length;
	
	return {
		total,
		totalPages,
		currentPage: page,
		posts
	};
};

const updatePost = async (req, res) => {
	const { username } = req.user;
	const { postId } = req.params;
	try {
		const post = await models.post.findOne({ _id: postId, author: username });
		
		if (!post) {
			return res.status(404).json({
				status: false,
				message: "Post not found"
			});
		}
		if (username !== post.author) {	
			return res.status(401).send({
				status: false,
				message: "Unauthorized user"
			});
		}
		if (post.deleted) {
			return res.status(204).json({
				status: true,
				message: "No content",
			});
		}
		post.state = "published";

		const result = await post.save();
		
	
		return res.status(200).render("viewPost", ({
			postId,
			post: result
		}));
	} catch (error) {
		console.error("Error reading task", error.message);
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const updatePrefill = async(req, res) => {
	const { postId } = req.params;
	const { username } = req.user;
	try {
		const post = await models.post.findOne({ _id: postId });
		if (!post) {
			return res.status(404).json({
				status: false,
				message: "post not found"
			});
		}
		if (post.deleted) {
			return res.status(204).json({
				status: false,
				message: "Invalid Post Id"
			});
		}
		if (username !== post.author) {
			return res.status(403).json({
				status: false,
				message: "You can not update this post unauthorized"
			});
		}

		return res.status(200).render("update", ({
			post, postId, author: username
		}));
	} catch (error) {
		logger.error(`Error fetching post: ${error.message}`);
		return res.status(500).json({
			status: false,
			message: "Internal server error",
		});
	}
};

const ownerPost = async (req, res) => {
	const { username } = req.user;
	let { page, limit, state } = req.query;
	
	try {
		page = page || 1;
		limit = limit || 20;
  
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
  
		let query = { username };

		if (state) {
			if (state === "draft" || state === "published") {
				query.state = state;
			}
		}

		const posts = await models.post.find(query)
			.limit(endIndex)
			.skip(startIndex)
			.exec();
  
		if (posts.length < 1) {
			return res.status(204).json({
				status: true,
				message: "No content",
			});
		}
  
		const count = await models.post.countDocuments(query);
  
		const totalPages = Math.ceil(count / limit);
		const total = posts.length;
  
		return res.status(200).render("viewPosts", {
			total,
			totalPages,
			currentPage: page,
			posts: posts
		});
	} catch (error) {
		logger.error(`Error fetching posts: ${error.message}`);
		return res.status(500).json({
			status: false,
			message: "Internal server error",
		});
	}
};

const readOwnerSinglePost = async(req, res) => {
	const { username } = req.user;
	const { postId } = req.params;

	try {
		const post = await models.user.findById(postId);
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

		post.readCount++;
		await post.save();

		return res.status(200).render("viewPost", ({
			post, postId, author: username
		}));
	} catch (error) {
		logger.error(`Error reading post: ${error.message}`);
		return res.status(500).json({
			status: false,
			message: "Internal server error"
		});
	}
};

const deletePost = async (req, res) => {
	const { username } = req.user;
	const { postId } = req.params;
	try {
		const post = await models.post.findOne({ _id: postId });
		if (!post) {
			return res.status(404).json({
				status: false,
				message: "post not found"
			});
		}
		if (post.deleted) {
			return res.status(204).json({
				status: false,
				message: "Invalid post Id"
			});
		}
		if (username !== post.author) {
			return res.status(403).json({
				status: false,
				message: "You are unauthorized to delete this post"
			});
		}
		await models.post.updateOne({ _id: post._id}, { deleted: true});
	
	} catch (error) {
		console.error(error.message);
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

module.exports = {
	createPost, viewOnePost, viewPosts, updatePost, deletePost, ownerPost, readOwnerSinglePost, updatePrefill
};

