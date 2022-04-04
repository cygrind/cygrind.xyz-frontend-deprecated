const express = require("express");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const { Strategy: SteamStrategy } = require("passport-steam");
const { Strategy: GithubStrategy } = require("passport-github2");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");

const { join } = require("path");
const { apiReq } = require("./util");
const dotenv = require("dotenv");
const app = express();
const port = 3000;

dotenv.config();

passport.serializeUser((user, done) => {
	done(null, user);
});

passport.deserializeUser((obj, done) => {
	done(null, out);
});

const deserialize = (user) => {
	let out = {
		flow: {
			t: user.provider, id: user.id, username: typeof user.displayName === "undefined" ? user.username : user.displayName
		}
	};
	return out;
}

// middleware
app.use(express.urlencoded({ extended: true }));
app.set("views", join(__dirname, "views"));
app.use(express.static("public"));
app.use(express.json());
app.use(cookieParser());

passport.use(new SteamStrategy({
	returnURL: 'http://localhost:3000/login/steam/process',
	realm: 'http://localhost:3000/',
	apiKey: process.env.STEAM_API_TOKEN
},
	async (_, profile, done) => {
		let [err, body] = await doFlow(profile);

		return done(err, body);
	}
));

passport.use(new GithubStrategy({
	clientID: process.env.GITHUB_CLIENT_ID,
	clientSecret: process.env.GITHUB_CLIENT_SECRET,
	callbackURL: "http://127.0.0.1:3000/login/github/process"
}, async (_, a, profile, done) => {
	let [err, body] = await doFlow(profile);

	return done(err, body);
}));

// passport.use(new GoogleStrategy({
// 	clientID: process.env.GOOGLE_CLIENT_ID,
// 	clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// 	callbackURL: "http://127.0.0.1:3000/login/google/process"
// }, async (_, a, profile, done) => {
// 	let [err, body] = await doFlow(profile);

// 	return done(err, body);
// }));

async function doFlow(profile) {
	let err = null;
	let de = deserialize(profile);

	console.log(de);

	let [code, body] = await apiReq(de, "login", "?t=flow", true, "POST");

	if (code !== 200) {
		err = body.message;
	}

	return [err, body];
}

// routing
const get = require("./routes/get");
app.use("/", get.home);

app.listen(port, () => console.log("Webserver up at 127.0.0.1 on port " + port));
