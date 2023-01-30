const jwt = require("jsonwebtoken");

const userModel = require("../model/userModel");

const isAuthorized = async (req, res, next) => {
  const authToken = req.headers.authorization;
  if (!authToken) {
    return res.send({ message: "Token required" });
  }
  const token = authToken.split(" ")[1];
  try {
    const user = await userModel.findOne({ token: token });
    if (!user) {
      return res.send({ message: "invalid Token" });
    }

    var decoded = jwt.verify(token, process.env.secret);
    if (!decoded) {
      return res.send({ message: "Jwt verification failed" });
    }
  } catch (err) {
    res.send(err);
  }
  next();
};

module.exports = { isAuthorized };
