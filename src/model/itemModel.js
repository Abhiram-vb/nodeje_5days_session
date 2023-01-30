const mongoose = require("mongoose");

const itemSchema = mongoose.Schema({
  item_name: {
    type: String,
    required: true,
    unique: true,
  },
  quantity: {
    type: Number,
    requried: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

itemSchema.pre("save", function (next) {
  this.item_name = this.item_name.toLowerCase();
  next();
});
const itemModel = mongoose.model("item", itemSchema);

module.exports = itemModel;
