const { User } = require("../models/user");
const express = require("express");
const bcrypt = require('bcryptjs');

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userList = await User.find();

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
        country: req.body.country
    })

    user = await user.save();

    if(!user){
        return res.status(500).send('User cannot be created');
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
