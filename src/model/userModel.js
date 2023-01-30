const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  first_name: String,
  last_name: String,
  email: {
    type: String,
    require: true,
    unique: true,
  },
  role: String,
  password: String,
  token: String,
});

const userModal = mongoose.model("person", userSchema);

module.exports = userModal;
