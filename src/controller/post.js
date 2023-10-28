const {validatePostData} = require("../validation/post");
const models = require("../models/model");

const createPost = async(req, res) => {
	const username = req.user;

	try {
		const user = await models.user.findOne(username);
		const {error, value} = validatePostData(req.body);
		if (error) {
			res.status(404).send({
				status: false,
				message: "Invalid post"
			});
		}
		const createdPost = await models.post.create({
			content: value.content,
			createdAt: value.createdAt,
			user: user.id
		});
		return res.status(201).json({
			status: true,
			message: "Post created",
			data: createdPost
		});
	} catch (error) {
		console.error("Error creating task");
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const readAllPost = async(req, res) => {
	const username = req.user;
	let { page, limit, status } = req.query;

	try {
		const user = await models.user.findOne({ username });
		page = page || 1;
		limit = limit || 10;
		
		const startIndex = (page - 1) * limit;
		const endIndex = page * limit;
		

		const tasks = await models.Task.find(query)
			.limit(endIndex)
			.skip(startIndex)
			.exec();
		
		if (tasks.length < 1) {
			return res.status(204).send({
				status: true,
				message: "No data"
			});
		}

		const count = await models.Task.countDocuments(query);
		
		const totalPages = Math.ceil(count / limit);
		const total = tasks.length;
		
		return res.status(200).json({
			status: true,
			message: "",
			data: {
				total,
				totalPages,
				currentPage: page,
				tasks
			}
		});
        
	} catch (error) {
		console.error("Error reading task");
		res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

