const express = require("express");
const Product = require("../models/products");
const { Category } = require("../models/category");
const mongoose = require("mongoose");

const router = express.Router();

// Route to get all the product
router.get(`/`, async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product id" });
  }
  try {
    // const productList = await Product.find().select('name image -_id'); // To get the name and image only from an api we use select method
    const productList = await Product.find().populate("category"); // To get the details of category we use populate method
    if (!productList) {
      return res.status(500).json({
        success: false,
        message: "Cannot find the product based on this id",
      });
    }
    res.send(productList);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to get a single product based on id
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product id" });
  }
  let productId = req.params.id;
  try {
    const product = await Product.findById(productId).populate("category");
    if (!product) {
      return res.status(404).json({ success: false });
    }
    res.send(product);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to create a new product
router.post(`/`, async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).send("Invalid Category");
    }
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      countInStock: req.body.countInStock,
      isFeatured: req.body.isFeatured,
    });

    product = await product.save();

    if (!product) {
      return res.status(500).send("The product cannot be created");
    }
    return res.send(product);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to update the a product
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product id" });
  }
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).send("Invalid Category");
    }
    let productId = req.params.id;
    let product = await Product.findByIdAndUpdate(
      productId,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: req.body.image,
        brand: req.body.brand,
        price: req.body.price,
        category: req.body.category,
        rating: req.body.rating,
        numReviews: req.body.numReviews,
        countInStock: req.body.countInStock,
        isFeatured: req.body.isFeatured,
      },
      {
        new: true,
      }
    );
    if (!product) {
      return res
        .status(404)
        .send({ success: false, message: "Product cannot be updated" });
    }
    res.status(200).send(product);
  } catch (err) {
    return res.status(500).send({ success: false, error: err.message });
  }
});

// Route to delete a product
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid product id" });
  }
  let productId = req.params.id;
  try {
    let product = await Product.findByIdAndDelete(productId);
    if (!product) {
      return res.status(404).send("Product cannot be deleted");
    }
    return res
      .status(200)
      .send({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
});

// Route to count all the product in our database
router.get(`/get/count`, async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    if (!productCount) {
      return res.status(500).json({ success: false });
    }
    res.send({ productCount: productCount });
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
});

module.exports = router;
