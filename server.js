require("dotenv").config();
const express = require("express");
const fs = require("fs");
const path = require("path");
const serverless = require("serverless-http");

const app = express();
const { Router } = express;
const router = Router();

const port = process.env.PORT || 5001;

app.use(express.json());

const filePath = path.join(
	__dirname,
	"data.json"
);

router.get("/blogs", (req, res) => {
	res.set(
		"Access-Control-Allow-Origin",
		"*"
	);
	fs.readFile(
		filePath,
		"utf8",
		(err, data) => {
			if (err) {
				console.error(
					`Error reading file from disk: ${err}`
				);
				res
					.status(500)
					.send({ error: err.message });
				return;
			}
			try {
				const parsedData =
					JSON.parse(data);
				res.send(parsedData);
			} catch (err) {
				console.error(
					`Error parsing JSON string: ${err}`
				);
				res
					.status(500)
					.send({ error: err.message });
			}
		}
	);
});

router.get("/blogs/:id", (req, res) => {
	res.set(
		"Access-Control-Allow-Origin",
		"*"
	);
	fs.readFile(
		filePath,
		"utf8",
		(err, data) => {
			if (err) {
				console.error(
					`Error reading file from disk: ${err}`
				);
				res.status(500).send({
					error: err.message,
				});
				return;
			}
			try {
				const parsedData =
					JSON.parse(data);
				const newData = parsedData.find(
					data =>
						req.params.id == data.id
				);
				res.send(newData);
			} catch (err) {
				console.error(
					`Error parsing JSON string: ${err}`
				);
				res.status(500).send({
					error: err.message,
				});
			}
		}
	);
});

router.post("/blogs", (req, res) => {
	res.set(
		"Access-Control-Allow-Origin",
		"*"
	);
	
	res.writeHead(200, {
            'Content-Type' : 'application/json'
        });
	
	const blog = req.body;
	fs.readFile(filePath, (err, data) => {
		if (err) {
			console.log(err.message);
			res.status(500).send(err.message);
		} else {
			var jsonData = JSON.parse(data);
			var id = jsonData.length;
			blog.id = id;
			jsonData.push(blog);
			fs.writeFile(
				filePath,
				JSON.stringify(jsonData),
				err => {
					if (err) {
						console.log(err.message);
						res
							.status(500)
							.send(err.message);
					} else {
						res
							.status(200)
							.send(
								"POST request made successfully"
							);
					}
				}
			);
		}
	});
});

router.delete(
	"/blogs/:id",
	(req, res) => {
		res.set(
			"Access-Control-Allow-Origin",
			"*"
		);

		const blogId = parseInt(
			req.params.id
		);

		const blogIndex = blogs.findIndex(
			blog => blog.id === blogId
		);
		if (blogIndex === -1) {
			res
				.status(404)
				.send(
					`Blog with ID ${blogId} not found`
				);
		} else {
			blogs.splice(blogIndex, 1);

			fs.writeFile(
				filePath,
				JSON.stringify(blogs, null, 2),
				error => {
					if (error) {
						console.error(
							"Error writing to file:",
							error
						);
						res
							.status(500)
							.send(
								"Error writing to file"
							);
					} else {
						res.send(
							`Post with ID ${blogId} has been deleted`
						);
					}
				}
			);
		}
	}
);

app.use("/api", router);

app.listen(port, () => {
	console.log(
		`Server listening on port ${port}`
	);
});

module.exports.handler =
	serverless(app);
