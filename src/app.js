
const {database} = require("./database.js");
require("dotenv").config();
const server = require("./utility/server.js");

const app = server();
const port = process.env.PORT;

app.listen(port, async () => {
	await database();
	console.log(`Your server is running on port ${port}`);
});