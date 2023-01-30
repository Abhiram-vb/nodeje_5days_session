const itemModel = require("../model/itemModel");
const { constant } = require(".././config");
const Redis = require("redis");

const redisClient = Redis.createClient();
redisClient.connect();

// Adding an item into database
const addItem = async (req, res) => {
  try {
    const item = await new itemModel(req.body);
    item.save((error) => {
      if (error) {
        if (error.code === 11000) {
          // handle the validation error
          return res.status(400).send({ message: "Duplicate Data sent" });
        }
      } else {
        res.status(constant.HTTP_201_CODE).send(item);
      }
    });
  } catch (error) {
    res.status(constant.HTTP_500_CODE).send(error);
  }
};

// returns all the items which are there in database
const showAll = async (req, res) => {
  const items = await itemModel.find({});
  res.status(constant.HTTP_200_CODE).send(items);
};

// return an item from db which matches the name provided in request param
const getItem = async (req, res) => {
  const item_name = req.params.name.toLowerCase();
  try {
    const item = await itemModel.find({ item_name: item_name });
    if (!item) {
      return res.status(constant.HTTP_400_CODE).send("Bad request");
    }
    if (item.length < 1) {
      return res
        .status(constant.HTTP_400_CODE)
        .send({ message: "No items are there with given name" });
    }
    return res.status(constant.HTTP_200_CODE).send(item);
  } catch (error) {
    res.status(constant.HTTP_500_CODE).send("Internal Server Error");
  }
};

// update an item in db
const updateItem = async (req, res) => {
  const item_name = req.params.name.toLowerCase();
  const newItems = {
    item_name: req.body.item_name.toLowerCase(),
    quantity: req.body.quantity,
    price: req.body.price,
  };
  try {
    const item = await itemModel.findOneAndUpdate(
      { item_name: item_name },
      newItems
    );
    if (!item) {
      return res
        .status(constant.HTTP_400_CODE)
        .send({ message: "Bad Request" });
    }
    item.save();
    res
      .status(constant.HTTP_200_CODE)
      .send({ message: "Updated Successfully" });
  } catch (error) {
    if (error.code == 11000) {
      return res
        .status(constant.HTTP_500_CODE)
        .send({ message: "can't update duplicate data" });
    }
    return res.status(constant.HTTP_500_CODE).send("Internal server error");
  }
};

// Delete item from db
const deleteItem = async (req, res) => {
  try {
    const name = req.params.name.toLowerCase();
    await itemModel.deleteOne({ item_name: name });
    res
      .status(constant.HTTP_200_CODE)
      .send({ message: "Item Deleted succesfully" });
  } catch (err) {}
};

module.exports = {
  addItem,
  showAll,
  getItem,
  updateItem,
  deleteItem,
};
