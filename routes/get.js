const router = require("express").Router();
const aero = require("@aero/http");
const fs = require("fs");
const jwt = require("jsonwebtoken");

const privKey = fs.readFileSync("private.pem");

module.exports = {
  home: router.get("/", (_, res) => {
    res.render("index.ejs");
  }),
  florp: router.get("/florp", (_, res) => {
    res.render("florp.ejs");
  }),
  dashboardGet: router.get("/dashboard", (req, res) => {
    res.render("dashboard.ejs");
  }),
  loginPost: router.post("/login", async (req, res) => {
    let [status, body] = await apiReq(req, "login", "?t=standard", true);

    res.status(status).json(body);
  }),
  signupPost: router.post("/signup", async (req, res) => {
    let errors = validateUsername(req.body.username);

    if (errors.length > 0) {
      let json = { errors: errors };
      res.status(400).json(json);

      return;
    }

    let [status, body] = await apiReq(req, "signup", "?t=standard", true);
    res.status(status).json(body);
  }),
  logoutPost: router.post("/logout", async (req, res) => {
    let [status, body] = await apiReq(req, "logout", null, false);

    res.status(status).json(body);
  }),
  
};

function validateUsername(username) {
  let errors = [];
  let username_regex = /^[a-zA-Z0-9_ ]+$/g;

  if (username.length < 3) {
    errors.push("Your username is too short.");
  }

  if (!username_regex.test(username)) {
    errors.push("Your username contains invalid characters.")
  }

  return errors;
}

function genToken(username, password) {
  return jwt.sign({ username: username, password: password, exp: Date.now() }, privKey, { algorithm: "RS256" });
}

async function apiReq(req, endpoint, query, private) {
  let headers;
  if (private) {
    headers = { "Content-Type": "application/json", "Authorization": "Bearer " + process.env.CYGRIND_API_TOKEN };
  } else {
    headers = { "Content-Type": "application/json" };
  }

  let json = JSON.stringify(req.body);

  let apiRes = await aero(`http://127.0.0.1:8080/${endpoint}${query ? query : ""}`)
    .method("POST")
    .header(headers)
    .body(json)
    .send();

  let body = await apiRes.body.json();
  console.log(body);

  return [apiRes.statusCode, body];
}