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

const validatePostData = (postData) => {
	const schema = joi.object({
		title: joi.string().min(2).max(20).required(),
		description: joi.string().min(1).max(2000).required(),
		body: joi.string().min(1).max(10000).required(),
		tags: joi.array().items(joi.string().min(1).max(50)).min(1).max(50).required(),
	});
	return schema.validate(postData, options);
};

module.exports = {validatePostData};