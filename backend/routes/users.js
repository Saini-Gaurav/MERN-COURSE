const { User } = require("../models/user");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Route to get all the users
router.get("/", async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");

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
    const user = await User.findById(userId).select("-passwordHash");
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
  let existingUser;
  try {
    //User can sign up with a phone number and email only once
    existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (existingUser) {
      return res.status(400).json({
        message: "Email or Phone already exists, Please login instead",
      });
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
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
    return res.status(201).send(user);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

//Route to login a user
router.post("/login", async (req, res) => {
  const secret = process.env.secret;
  try {
    //User can log in via email or phone number with password
    let user = await User.findOne({
      $or: [{ email: req.body.email }, { phone: req.body.phone }],
    });
    if (!user) {
      return res.status(401).send("Invalid Credentials");
    }
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
        },
        secret,
        { expiresIn: "1d" }
      );
      const credentialUsed =
        req.body.email || req.body.phone === user.email
          ? user.email
          : user.phone;
      return res.status(200).send({ user: credentialUsed, token: token });
    } else {
      return res.status(401).send("Password is invalid");
    }
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
