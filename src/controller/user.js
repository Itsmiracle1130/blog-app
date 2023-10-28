const {validateUserInfo} = require("../validation/user");
const models = require("../models/model");
const bcrypt = require("bcrypt");
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
            dob: value.dob,
            gender: value.gender,
			password: hashedPassword,
            accountCreatedOn: value.createdAt
		});
		return res.status(201).json({
			status: true,
			message: "Account successfully created",
			data: createdUser
		});
	} catch (error) {
		console.error("Error fetching user data", error);
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
        // console.log(existingUser)
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
		const token = await createToken({ id: existingUser.id, email: existingUser.email});
		const user = await models.user.findOne({ username: value.username }).select("-password");
		res.cookie("token", token, { httpOnly: true });
		return res.status(200).json({
			status: true,
			message: "Login Successful",
			data: { token, user }
		});
	} catch (error) {
		console.error("Error fetching user Data", error);
		return res.status(500).send({
			status: false,
			message: "Internal server error"
		});
	}
};

module.exports = {
	userSignup, userLogin
};