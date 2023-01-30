require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const routes = require("./src/routes/router");

const app = express();
const port = process.env.PORT || 3000;
const ip = process.env.IP || "0.0.0.0";
const db = mongoose.connection;
app.use(express.json());
app.use(routes);

app.listen(port, ip, () => {
  try {
    mongoose.connect(process.env.MONGOURL);
    db.on("error", () => console.log(`Database connection error`));
    db.once("open", function () {
      console.log("Mongodb connected.");
    });
  } catch (error) {
    console.log(`someting went worng ${error}`);
  }
  console.log(`Example app listening on ${port} port!`);
});

module.exports = app;
