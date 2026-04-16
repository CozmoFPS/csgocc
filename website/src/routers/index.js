const fs = require("fs");
const path = require("path");
const { apiResponse } = require("../services/api.service");
const app = require("../services/webapp.service").app;

let routerFileNames = fs.readdirSync(__dirname).filter(x => x !== "index.js" && x.endsWith(".router.js"));
for (let routerFileName of routerFileNames) {
	const routerFilePath = path.join(__dirname, routerFileName);
	const router = require(routerFilePath);
	console.log("Routing: " + routerFileName);

	if (!router) continue;

	app.use(router);
}

app.use((_, res) => {
	//res.redirect("/?error=404");
	res.send('Not Found')
})

app.use((err, req, res, next) => {
	console.error(err.stack)
	console.log("^^^ Unknown error occurred! ^^^");
	apiResponse({
		HTTPCode: 500,
		success: false,
		message: "An unknown server error occurred.",
		res
	})
})