const express = require("express");
const { join } = require("path");
const app = express();
const port = 8080;
let { connect, connection, set, Promise: MongoosePromise } = require("mongoose");

// mongoose
set("useFindAndModify", false);
set("useCreateIndex", true);
MongoosePromise = global.Promise;

const dbOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  poolSize: 5,
  connectTimeoutMS: 10000,
  family: 4
};

// await connect("mongodb://127.0.0.1:6969/cygrind", dbOptions);
// 
// connection.on("connected", () => {
  // console.log("Connected to database");
// });

// middleware
app.use(express.urlencoded({extended: true}));
app.set("views", join(__dirname, "views"));
app.use(express.static("public"));

// routing
const get = require("./routes/get");
app.use("/", get.home);

app.listen(port, () => console.log("Webserver up at 127.0.0.1 on port " + port));
