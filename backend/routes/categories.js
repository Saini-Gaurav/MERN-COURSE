const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    return res.status(500).json({ success: false });
  }
  res.status(200).send(categoryList);
});

router.post("/", async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();

  if (!category) {
    return res.status(404).send({success: true, message: "Category cannot be created"});
  }

  res.status(200).send(category);
});

router.put('/:id', async(req, res) =>{
    const categoryId = req.params.id;
    try {
        let category = await Category.findByIdAndUpdate(categoryId, {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color
        },
        {
            new: true
        }
    )
    if(!category){
        return res.status(404).send({success: false, mesaage: 'Category cannot be updated'})
    }
    res.status(200).send(category)
    }
    catch (err){
        return res.status(500).send({success: false, error: err})
    }
})

router.get('/:id', async(req, res)=>{
    const categoryId = req.params.id;
    try {
        const category = await Category.findById(categoryId);
        if(!category){
            return res.status(404).send({success: false, message: 'Category not found!'})
        }
        res.status(200).send(category);
    }
    catch(err){
        return res.status(500).send({success: false, error: err})
    }

})

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
