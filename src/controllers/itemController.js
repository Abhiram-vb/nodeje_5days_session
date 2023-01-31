const itemModel = require("../model/itemModel");
const { constant, allDataKey } = require(".././config");
const Redis = require("redis");
const { eachItem } = require(".././config");

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
  let data = "";
  await redisClient.get(allDataKey, (err, reply) => {
    if (err) {
      res.status(constant.HTTP_500_CODE).send(err);
    } else {
      data = JSON.parse(reply);
    }
  });
  if (data != "") {
    res.status(constant.HTTP_200_CODE).send(data);
  } else {
    data = await itemModel.find({});
    await redisClient.setEx(allDataKey, 1000, JSON.stringify(data));
    res.status(constant.HTTP_200_CODE).send(data);
  }
};

// return an item from db which matches the name provided in request param
const getItem = async (req, res) => {
  const item_name = req.params.name.toLowerCase();
  let item = "";
  try {
    await redisClient.hGet(eachItem, item_name, (err, reply) => {
      if (err) {
        console.error(err);
      } else {
        item = JSON.parse(reply);
        console.log(`Value for field ${field1}: ${value}`);
      }
    });
    if (item === "") {
      item = await itemModel.find({ item_name: item_name });
    }
    if (!item) {
      return res.status(constant.HTTP_400_CODE).send("Bad request");
    }
    if (item.length < 1) {
      return res
        .status(constant.HTTP_400_CODE)
        .send({ message: "No items are there with given name" });
    }
    await redisClient.hSet(eachItem, item_name, JSON.stringify(item));
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
    redisClient.del(allDataKey);
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
    redisClient.del(allDataKey);
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
