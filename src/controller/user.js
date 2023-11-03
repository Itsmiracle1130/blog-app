const {validateUserSignup, validateUserLogin} = require("../validation/user");
const models = require("../models/model");
const bcrypt = require("bcrypt");
const logger = require("../utility/logger");
const { createToken } = require("../utility/jwt.js");

const userSignup = async (req, res) => {
	try {
		const { error, value } = validateUserSignup(req.body);
		if(error) {
			return res.status(400).send({
				status: false,
				message: error.message
			});
		}
		const existingUser = await models.user.findOne({
			$or: [{
				email: value.email
			}, {
				username: value.username
			}]
		});
		if(existingUser) {
			return res.status(409).send({
				status: false,
				message: "Account already exist"
			});
		}
		const hashedPassword = await bcrypt.hash(value.password, 10);
		const createdUser = await models.user.create({
			firstName: value.firstName,
			lastName: value.lastName,
			email: value.email,
			username: value.username,
			password: hashedPassword
		});
		return res.status(201).render("login", ({
			createdUser
		}));
	} catch (error) {
		console.error(error.message);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const userLogin = async (req, res) => {
	try {
		const { error, value } = validateUserLogin(req.body);
		if(error) {
			return res.status(400).send({
				status: false,
				message: error.message
			});
		}
		const existingUser = await models.user.findOne({
			$or: [{
				email: value.emailUsername
			}, {
				username: value.emailUsername
			}]
		});
		if(!existingUser) {
			return res.status(404).send({
				status: false,
				message: "Invalid username or password"
			});
		}
		const passwordCompare = await bcrypt.compare(value.password, existingUser.password);
		if(!passwordCompare) {
			return res.status(404).send({
				status: false,
				message: "Invalid username or password"
			});
		}
		const token = await createToken({ id: existingUser.id, username: existingUser.username, email: existingUser.email});
	
		res.cookie("token", token, { httpOnly: true });
		return res.status(200).redirect("./dashboard");
	} catch (error) {
		console.error(error.message);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const viewUser = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await models.user.findById({ username });

		if (!user) {
			return res.status(404).json({
				status: false,
				message: "User not found"
			});
		}

		return res.status(200).render("viewProfile", ({
			user, posts: user.posts.length
		}));
	} catch (error) {
		logger.error(`Error locating user: ${error.message}`);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const logout = async (req, res) => {
	try {
		res.clearCookie("token");
		return res.status(440).render("login");
	} catch (error) {
		logger.error(`Logout error: ${error.message}`);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

module.exports = {
	userSignup, userLogin, viewUser, logout
};