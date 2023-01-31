const jwt = require("jsonwebtoken");
const { constant } = require("../config");

const userModel = require("../model/userModel");

let role = "";
const isAuthorized = async (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res
      .status(constant.HTTP_499_CODE)
      .send({ message: "Token required" });
  }
  const token = authToken.split(" ")[1];
  try {
    const user = await userModel.findOne({ token: token });
    if (!user) {
      return res
        .status(constant.HTTP_498_CODE)
        .send({ message: "invalid Token" });
    }

    var decoded = jwt.verify(token, process.env.secret);
    role = decoded.role;
    if (!decoded) {
      return res
        .status(constant.HTTP_401_CODE)
        .send({ message: "Jwt verification failed" });
    }
  } catch (err) {
    res.send(err);
  }
  next();
};

const verifyUserRole = async (req, res, next) => {
  if (role === "user" || role == "admin") {
    next();
  } else {
    return res
      .status(constant.HTTP_401_CODE)
      .send({ message: "Role must be a user" });
  }
};

const verifyAdminRole = async (req, res, next) => {
  if (role === "admin") {
    next();
  } else {
    return res
      .status(constant.HTTP_401_CODE)
      .send({ message: "Role must be a admin" });
  }
};

module.exports = { isAuthorized, verifyUserRole, verifyAdminRole };
