const router = require("express").Router();
const aero = require("@aero/http");
const passport = require("passport");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { v4: uuidV4 } = require("uuid");
const { apiReq } = require("../util");
const Cache = require("timed-cache");
const { btoa } = require("abab");

const privKey = fs.readFileSync("private.pem");
const handOff = new Cache({ defaultTtl: 300 * 1000 });

module.exports = {
	home: router.get("/", async (_, res) => {
		let patternsRes = await aero("http://127.0.0.1:8080/patterns/search").query({ "q": "testy", "max": 12 }).send();

		if (patternsRes.statusCode === 200) {
			let body = await patternsRes.body.json();
			res.render("index.ejs", { featured: body.patterns });
			return;
		}

		res.render("index.ejs", { featured: [] });
	}),
	florp: router.get("/florp", (_, res) => {
		res.render("florp.ejs");
	}),
	dashboardGet: router.get("/dashboard", async (req, res) => {
		let userId = req.cookies.userId;

		let patternsRes = await aero("http://127.0.0.1:8080/patterns/search").query({ "q": userId, "max": 12 }).send();
		let patterns = (await patternsRes.body.json());

		if (typeof patterns.message === "undefined") {
			patterns = patterns.patterns;
		} else {
			patterns = [];
		}

		res.render("dashboard.ejs", { patterns: patterns });
	}),
	patternViewGet: router.get("/patterns/:id", async (req, res) => {
		console.log(req.params.id);
		let patternRes = await aero(`http://127.0.0.1:8080/patterns/${req.params.id}`);

		if (patternRes.statusCode !== 200) {
			console.log(await patternRes.body.json());
			res.redirect("/");
			return;
		}

		res.render("pattern.ejs", { pattern: await patternRes.body.json() })
	}),

	loginPost: router.post("/login", async (req, res) => {
		let [status, body] = await apiReq({ standard: req.body }, "login", "?t=standard", true, "POST");
		
		if (status === 200) {
			res.status(200)
				.cookie("session", body.session_id)
				.cookie("username", body.username)
				.cookie("displayname", body.displayname)
				.cookie("userId", body.user_id)
				.json({});

			return;
		}

		res.status(status).json(body);

	}),

	loginWithSteam: router.get("/login/steam", passport.authenticate("steam")),
	loginWithSteamProcess: router.get("/login/steam/process", passport.authenticate("steam", { failureRedirect: "/" }), (req, res) => {
		res.redirect("/dashboard?handoff=" + getState(req.user));
	}),
	loginWithGithub: router.get("/login/github", passport.authenticate("github")),
	loginWithGithubProcess: router.get("/login/github/process", passport.authenticate("github", { failureRedirect: "/" }), (req, res) => {
		res.redirect("/dashboard?handoff=" + getState(req.user));
	}),
	loginWithGoogle: router.get("/login/google", passport.authenticate("google", { scope: ["profile"] })),
	loginWithGoogleProcess: router.get("/login/google/process", passport.authenticate("google", { failureRedirect: "/" }), (req, res) => {
		res.redirect("/dashboard?handoff=" + getState(req.user));
	}),

	hOf: router.get("/handoff/:id", (req, res) => {
		let user = handOff.get(req.params.id);
		if (typeof user === "undefined") {
			res.status(404).json({ message: "Handoff ID not found." })
		}

		console.log(handOff.get(req.params.id));
		handOff.remove(req.params.id);

		res.status(200)
		.cookie("session", user.session_id)
		.cookie("username", user.username)
		.cookie("displayname", user.displayname)
		.cookie("userId", user.user_id)
		.json({});
	}),

	signupPost: router.post("/signup", async (req, res) => {
		let errors = validateUsername(req.body.username);

		if (errors.length > 0) {
			let json = { errors: errors };
			res.status(400).json(json);

			return;
		}

		let [status, body] = await apiReq({ standard: req.body }, "signup", "?t=standard", true, "POST");

		if (status === 200) {
			res.status(200)
				.cookie("session", body.session_id)
				.cookie("username", body.username)
				.cookie("displayname", body.displayname)
				.cookie("userId", body.user_id)
				.json({});

			return;
		}

		res.status(status).json(body);
	}),
	logoutPost: router.post("/logout", async (req, res) => {
		let [status, body] = await apiReq(req.body, "logout", null, true, "POST");

		res.status(status).json(body);
	}),
};

function getState(user) {
	let state = uuidV4();
	handOff.put(state, user);

	return state;
}

function validateUsername(username) {
	let errors = [];
	let username_regex = /^[a-zA-Z0-9_ ]+$/g;

	if (username.length < 3) {
		errors.push("Your username is too short.");
	}

	if (username.length > 50) {
		errors.push("Your username is too long.");
	}

	if (!username_regex.test(username)) {
		errors.push("Your username contains invalid characters.")
	}

	if (username === "too short") {
		errors.push('Your username is "too short".')
	}

	return errors;
}

function genToken(username, password) {
	return jwt.sign({ username: username, password: password, exp: Date.now() }, privKey, { algorithm: "RS256" });
}

// async function apiReq(req, endpoint, query, private, method = "GET") {
// 	let headers;
// 	if (private) {
// 		headers = { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.CYGRIND_API_TOKEN };
// 	} else {
// 		headers = { "Content-Type": "application/json" };
// 	}

// 	let json = JSON.stringify(req.body);

// 	let apiRes = await aero(`http://127.0.0.1:8080/${endpoint}${query ? query : ""}`)
// 		.method(method)
// 		.header(headers)
// 		.body(json)
// 		.send();

// 	let body = await apiRes.body.json();

// 	return [apiRes.statusCode, body];
// }