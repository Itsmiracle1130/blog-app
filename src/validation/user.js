const joi = require("joi");

const options = {
	stripUnknown: true,
	abortEarly: false,
	errors: {
		wrap: {
			label: ""
		}
	}
};

const validateUserInfo = (userInfo) => {
	const schema = joi.object({
		firstName: joi.string().min(3).max(20).required(),
		lastName: joi.string().min(3).max(20).required(),
		email: joi.string().email().min(6).max(20).required(),
		password: joi.string().min(6).max(20).required()
	});
	return schema.validate(userInfo, options);
};

module.exports = {validateUserInfo};