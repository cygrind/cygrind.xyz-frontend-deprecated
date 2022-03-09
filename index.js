const express = require("express");
const { join } = require("path");
const app = express();
const port = 3000;

// middleware
app.use(express.urlencoded({extended: true}));
app.set("views", join(__dirname, "views"));
app.use(express.static("public"));

// routing
const get = require("./routes/get");
app.use("/", get.home);

app.listen(port, () => console.log("Webserver up at 127.0.0.1 on port " + port));
