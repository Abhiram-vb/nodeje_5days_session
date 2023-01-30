const userModal = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { saltRounds } = require(".././config");
let refreshTokens = [];
const Redis = require("redis");
const { use } = require("chai");
const redisClient = Redis.createClient();
redisClient.connect();

const signUp = async (req, res) => {
  try {
    req.body.password = await bcrypt.hashSync(req.body.password, saltRounds);
    const user = await new userModal(req.body);
    user.save((error) => {
      if (error) {
        if (error.code === 11000) {
          // handle the validation error
          return res
            .status(400)
            .send({ message: "user with same email already exist" });
        }
      } else {
        res.status(201).send(user);
      }
    });
  } catch (error) {
    res.status(500).send(error);
  }
};

const signIn = async (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const user = await userModal.findOne({ email: username });
  if (!user) {
    return res.status(404).send({ message: "user not found" });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(404).send({ message: "username & password not matched" });
  }
  const token = await jwt.sign(
    { first_name: user.first_name, role: user.role },
    process.env.secret
  );
  redisClient.setEx("authtoken", 1000, JSON.stringify(token));
  const refreshToken = jwt.sign(
    { first_name: user.first_name, role: user.role },
    process.env.REFRESH_TOKEN_SECRET
  );
  redisClient.setEx("refreshtoken", 10000, JSON.stringify(refreshToken));
  refreshTokens.push(refreshToken);
  const userData = await userModal.findByIdAndUpdate(
    { _id: user._id },
    { token: token }
  );
  userData.save();
  const data = {
    accesstoken: `${token}`,
    refreshtoken: refreshToken,
    email: username,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  };
  return res.send(data);
};

const removeUser = async (req, res) => {
  const email = req.body.email;
  await userModal.deleteOne({ email: email });
  res.send({ message: "user Deleted succesfully" });
};

const token = (req, res) => {
  const refreshToken = req.body.token;
  if (refreshToken == null) return res.sendStatus(401);
  if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403);
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign(
      { first_name: user.first_name, role: user.role },
      process.env.secret,
      {
        expiresIn: "1000s",
      }
    );
    res.json({ accessToken: accessToken });
  });
};

const profile = async (req, res) => {
  res.send("welcome to this page");
};

const logout = async (req, res) => {
  const authToken = req.headers.authorization;
  const token = authToken.split(" ")[1];
  const user = await userModal.findOneAndUpdate(
    { token: token },
    { token: "some" },
    {
      new: true,
    }
  );
  user.save();
  res.status(200).send({ message: "logout" });
};

module.exports = {
  signUp,
  signIn,
  logout,
  profile,
  token,
  removeUser,
};
