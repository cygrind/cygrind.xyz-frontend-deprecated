const express = require("express");
const { connect, connection, set, Promise: MongoosePromise } = require("mongoose");
const app = express();
const port = 3000;

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

await connect("mongodb://127.0.0.1:6969/cygrind", dbOptions);

connection.on("connected", () => {
  console.log("Connected to database");
});

app.listen(port, () => console.log("Webserver up at 127.0.0.1 on port " + port));
