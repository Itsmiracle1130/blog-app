const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.JWT_SECRET;

const createToken = async(payload) => {
	const token = jwt.sign(payload, secret, { expiresIn: "1h" });
	return token;
};

const validateUserToken = async (token) => {
	try {
		const key = process.env.JWT_SECRET || "secret";
		const data = jwt.verify(token, key);
		if (!data) return;

		return data;
	} catch (error) {
		console.error(error);
	}
};

module.exports = {
	createToken, validateUserToken
};