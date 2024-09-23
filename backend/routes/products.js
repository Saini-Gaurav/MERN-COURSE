const express = require("express");
const Product = require("../models/products");
const { Category } = require("../models/category");
const mongoose = require("mongoose");
const multer = require("multer");

const router = express.Router();

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid image type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

// Route to get all the product
router.get(`/`, async (req, res) => {
  try {
    let filter = {};
    if (req.query.categories) {
      filter = { category: req.query.categories.split(",") };
    }
    // const productList = await Product.find().select('name image -_id'); // To get the name and image only from an api we use select method
    const productList = await Product.find(filter).populate("category"); // To get the details of category we use populate method
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
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  try {
    const category = await Category.findById(req.body.category);
    if (!category) {
      return res.status(404).send("Invalid Category");
    }
    const file = req.file;
    if (!file) {
      return res.status(404).send("There is no file in the request");
    }
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    let product = new Product({
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: `${basePath}${fileName}`,
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
router.put("/:id", uploadOptions.single("image"), async (req, res) => {
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

    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Invalid Product");
    }

    const file = req.file;
    let imagepath;

    if (file) {
      const fileName = file.filename;
      const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
      imagepath = `${basePath}${fileName}`;
    } else {
      imagepath = product.image;
    }

    let productId = req.params.id;
    let updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name: req.body.name,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: imagepath,
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
    if (!updatedProduct) {
      return res
        .status(404)
        .send({ success: false, message: "Product cannot be updated" });
    }
    res.status(200).send(updatedProduct);
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
router.get("/get/count", async (req, res) => {
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

// Route to show the featured Product
router.get("/get/feature/:count", async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  try {
    const featureProduct = await Product.find({ isFeatured: true }).limit(
      +count
    );
    if (!featureProduct) {
      return res.status(500).json({ success: false });
    }
    res.send(featureProduct);
  } catch (err) {
    return res.status(400).send({ success: false, error: err.message });
  }
});

// Route to add the multiple images
router.put(
  "/gallery-images/:id",
  uploadOptions.array('images', 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid product id" });
    }
    
    let files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;

    if(files){
      files.map((file) =>{
        imagesPaths.push(`${basePath}${file.filename}`)
      })
    }

    try {
      let product = await Product.findByIdAndUpdate(
        req.params.id,
        {
         images: imagesPaths
        },
        {
          new: true,
        }
      );
      if (!product) {
        return res
          .status(404)
          .send({ success: false, message: "The gallery  cannot be updated" });
      }
      res.status(200).send(product);
      
    } catch (err) {
      return res.status(400).send({ success: false, error: err.message });
    }
  }
);

module.exports = router;
