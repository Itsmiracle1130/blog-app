const logger = require("../utility/logger.js");

const requestLogger = (req, res, next) => {
	logger.info(`${req.method} ${req.url}`);
	next();
};

module.exports = requestLogger;
