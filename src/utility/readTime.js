const calculateReadTime = (post) => {
	const words = post.split(" ");
	const wordCount = words.length;
	const readTime = Math.round(wordCount / 100);
	return readTime;
};
const splitTags = (req, res, next) => {
	if (req.body.tags) {
		req.body.tags = req.body.tags.split(",").map(tag => tag.trim());
	}
	next();
};
  
module.exports = { calculateReadTime, splitTags };