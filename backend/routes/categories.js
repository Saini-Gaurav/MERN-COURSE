const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    return res.status(500).json({ success: false });
  }
  res.send(categoryList);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) {
    return res.status(404).send("Category cannot be created");
  }

  res.send(category);
});

router.delete("/:id", async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) {
      return res.status(404).send("Category cannot be deleted");
    }

    return res
      .status(200)
      .send({ succes: true, message: "Category deleted Successfully" });
  } catch (err) {
    return res.status(400).send({ success: false, error: err });
  }
});

module.exports = router;
