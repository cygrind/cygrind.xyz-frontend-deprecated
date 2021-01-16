const router = require("express").Router();

module.exports = {
  home: router.get("/", (req, res) => {
    res.render("index.ejs");
  }),
  florp: router.get("/florp", (req, res) => {
    res.render("florp.ejs");
  }),
};