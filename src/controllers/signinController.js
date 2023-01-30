const userModal = require("../model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { saltRounds, constant, expiration_time } = require(".././config");
const Redis = require("redis");

const redisClient = Redis.createClient();
redisClient.connect();
let refreshTokens = [];

// Creating a new user
const signUp = async (req, res) => {
  try {
    req.body.password = await bcrypt.hashSync(req.body.password, saltRounds);
    const user = await new userModal(req.body);
    user.save((error) => {
      if (error) {
        if (error.code === 11000) {
          // handle the validation error
          return res
            .status(constant.HTTP_400_CODE)
            .send({ message: "user with same email already exist" });
        }
      } else {
        res.status(constant.HTTP_201_CODE).send(user);
      }
    });
  } catch (error) {
    res.status(constant.HTTP_500_CODE).send(error);
  }
};

// Login with email and password. After login accesstoken and refresh token is generated
const signIn = async (req, res) => {
  const username = req.body.email;
  const password = req.body.password;
  const user = await userModal.findOne({ email: username });
  if (!user) {
    return res
      .status(constant.HTTP_401_CODE)
      .send({ message: "user not found" });
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res
      .status(constant.HTTP_401_CODE)
      .send({ message: "username & password not matched" });
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
  return res.status(constant.HTTP_200_CODE).send(data);
};

// Removing the user from database
const removeUser = async (req, res) => {
  const email = req.body.email;
  await userModal.deleteOne({ email: email });
  res
    .status(constant.HTTP_200_CODE)
    .send({ message: "User Deleted Succesfully" });
};

// Creating accesstoken from refreshtoken
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
        expiresIn: expiration_time,
      }
    );
    res.status(constant.HTTP_200_CODE).json({ accessToken: accessToken });
  });
};

// created this method for testing api
const profile = async (req, res) => {
  res.status(constant.HTTP_200_CODE).send("Welcome to this page");
};

// removing accesstoken when logout
const logout = async (req, res) => {
  const authToken = req.headers.authorization;
  const token = authToken.split(" ")[1];
  const user = await userModal.findOneAndUpdate(
    { token: token },
    { token: "" },
    {
      new: true,
    }
  );
  user.save();
  res
    .status(constant.HTTP_200_CODE)
    .send({ message: "Logged out successfully" });
};

module.exports = {
  signUp,
  signIn,
  logout,
  profile,
  token,
  removeUser,
};
