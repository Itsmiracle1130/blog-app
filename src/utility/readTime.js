const calculateReadTime = (post) => {
	const words = post.split(" ");
	const wordCount = words.length;
	const readTime = Math.round(wordCount / 100);
	return readTime;
};
  
module.exports = { calculateReadTime };