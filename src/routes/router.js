const express = require("express");
const { isAuthorized } = require("../middleware/auth");

const Router = express.Router();

const {
  signUp,
  signIn,
  profile,
  logout,
  token,
  removeUser,
} = require(".././controllers/signinController");

const {
  addItem,
  showAll,
  getItem,
  updateItem,
  deleteItem,
} = require(".././controllers/itemController");

// Router.get("/users", isAuthorized, getusers);
Router.get("/logout", isAuthorized, logout);
Router.post("/signup", signUp);
Router.post("/login", signIn);
Router.get("/profile", isAuthorized, profile);
Router.delete("/deleteuser", removeUser);
Router.post("/token", token);

Router.post("/additem", isAuthorized, addItem);
Router.get("/getallItems", isAuthorized, showAll);
Router.get("/getItem/:name", isAuthorized, getItem);
Router.put("/updateItem/:name", isAuthorized, updateItem);
Router.delete("/deleteItem/:name", isAuthorized, deleteItem);

module.exports = Router;
