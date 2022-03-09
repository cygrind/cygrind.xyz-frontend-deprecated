const router = require("express").Router();
const aero = require("@aero/http");

module.exports = {
  home: router.get("/", (_, res) => {
    res.render("index.ejs");
  }),
  florp: router.get("/florp", (_, res) => {
    res.render("florp.ejs");
  }),
  dashboardGet: router.get("/dashboard", (_, res) => {
    res.render("dashboard.ejs");
  }),
  loginPost: router.post("/login", async (req, res) => {
    let json = JSON.stringify(req.body);

    let apiRes = await aero("http://127.0.0.1:8080/login?t=standard").method("POST").header({ "Content-Type": "application/json" }).body(json).send();
    let body = await apiRes.body.json();
    console.log(body);

    // res
    //   .cookie("session", body.session_id)
    //   .cookie("username", body.username)
    //   .cookie("displayname", body.displayname)
    //   .cookie("user_id", body.user_id)
    //   .redirect("/dashboard")

    res.json(body);
  }),
  loginPost: router.post("/signup", async (req, res) => {
    let json = JSON.stringify(req.body);

    let apiRes = await aero("http://127.0.0.1:8080/signup?t=standard").method("POST").header({ "Content-Type": "application/json" }).body(json).send();
    let body = await apiRes.body.json();

    // res
    //   .cookie("session", body.session_id)
    //   .cookie("username", body.username)
    //   .cookie("displayname", body.displayname)
    //   .cookie("user_id", body.user_id)
    //   .redirect("/dashboard")

    res.json(body);
  }),
};