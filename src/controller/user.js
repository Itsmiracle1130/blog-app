const {validateUserInfo} = require("../validation/user");
const models = require("../models/model");
const bcrypt = require("bcrypt");
const logger = require("../utility/logger");
const { createToken } = require("../utility/jwt.js");

const userSignup = async (req, res) => {
	try {
		const { error, value } = validateUserInfo(req.body);
		if(error) {
			return res.status(400).send({
				status: false,
				message: error.message
			});
		}
		const existingUser = await models.user.findOne({ email: value.email });
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
			password: hashedPassword
		});
		// render views
		return res.status(201).json({
			status: true,
			message: "Account successfully created",
			data: createdUser
		});
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
		const { error, value } = validateUserInfo(req.body);
		if(error) {
			return res.status(400).send({
				status: false,
				message: error.message
			});
		}
		const existingUser = await models.user.findOne({ email: value.email });
		if(!existingUser) {
			return res.status(404).send({
				status: false,
				message: "Invalid username or password"
			});
		}
		const passwordCompare = await bcrypt.compare(value.password, existingUser.password);
		if(!passwordCompare) {
			// render views
			return res.status(404).send({
				status: false,
				message: "Invalid username or password"
			});
		}
		const token = await createToken({ id: existingUser.id, email: existingUser.email});
		const user = await models.user.findOne({ email: value.email }).select("-password");
		res.cookie("token", token, { httpOnly: true });
		// render views
		return res.status(200).json({
			status: true,
			message: "Login Successful",
			data: { token, user }
		});
	} catch (error) {
		console.error(error.message);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

const logout = async (req, res) => {
	try {
		res.clearCookie("token");
		// render
		return res.status(440).render(".....");
	} catch (error) {
		logger.error(`Logout error: ${error.message}`);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

module.exports = {
	userSignup, userLogin, logout
};