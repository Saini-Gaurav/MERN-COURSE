const { User } = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Route to get all the users
router.get("/", async (req, res) => {
  try {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
      return res.status(500).json({ success: false });
    }
    res.send(userList);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

//Route to get the specific user based on the id
router.get("/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res
        .status(500)
        .json({ message: "The user with the given id was not found" });
    }
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

//Route to create a users
router.post("/", async (req, res) => {
  try {
    let user = new User({
      name: req.body.name,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      isAdmin: req.body.isAdmin,
      street: req.body.street,
      apartment: req.body.apartment,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });

    user = await user.save();

    if (!user) {
      return res.status(500).send("User cannot be created");
    }
    return res.status(200).send(user);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
