const express = require("express");
const Product = require("../models/products");
const { Category } = require("../models/category");

const router = express.Router();

router.get(`/`, async (req, res) => {
  try {
    const productList = await Product.find();
    if (!productList) {
      return res.status(500).json({ success: false });
    }
    res.send(productList);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

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

module.exports = router;
