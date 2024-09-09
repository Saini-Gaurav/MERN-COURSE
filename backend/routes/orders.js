const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-items");
const router = express.Router();
const mongoose = require("mongoose");

// Route to get all the orders
router.get(`/`, async (req, res) => {
  try {
    const orderList = await Order.find()
      .populate("user", "name")
      .sort({ dateOrdered: -1 });

    if (!orderList) {
      res.status(500).json({ success: false, message: "No order found" });
    }
    res.send(orderList);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to get the specific order based on the order id
router.get("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order id" });
  }
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId)
      .populate("user", "name")
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      });
    if (!order) {
      return res
        .status(404)
        .send({ success: false, message: "Order not found" });
    }
    return res.send(order);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to create a order
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemsIds) => {
      const orderItem = await OrderItem.findById(orderItemsIds).populate(
        "product",
        "price"
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );

  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  console.log(totalPrices);

  try {
    let order = new Order({
      orderItems: orderItemsIdsResolved,
      shippingAddress1: req.body.shippingAddress1,
      shippingAddress2: req.body.shippingAddress2,
      city: req.body.city,
      zip: req.body.zip,
      country: req.body.country,
      phone: req.body.phone,
      status: req.body.status,
      totalPrice: totalPrice,
      user: req.body.user,
    });
    order = await order.save();
    if (!order) {
      return res
        .status(404)
        .send({ success: false, message: "Order cannot be created" });
    }
    return res.status(201).send(order);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to update the order status
router.put("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order id" });
  }
  try {
    const orderId = req.params.id;
    const order = await Order.findByIdAndUpdate(
      orderId,
      {
        status: req.body.status,
      },
      {
        new: true,
      }
    );
    if (!order) {
      return res
        .status(404)
        .send({ success: false, message: "Product not found" });
    }
    return res.send(order);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to delete a order
router.delete("/:id", async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid order id" });
  }
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .send({ success: false, message: "Order not found" });
    }
    await OrderItem.deleteMany({ _id: { $in: order.orderItems } });
    await Order.findByIdAndDelete(orderId);
    return res
      .status(200)
      .send({ success: true, message: "Order deleted successfully" });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

//Route to get the total sales
router.get("/get/totalsales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalsales: { $sum: "$totalPrice" } } },
    ]);

    if (!totalSales) {
      return res
        .status(404)
        .send({ sucess: false, message: "Total sale cannot be generated" });
    }
    return res.status(200).send({ totalsales: totalSales.pop().totalsales });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to get the count of the orders
router.get("/get/count", async (req, res) => {
  try {
    const orderCount = await Order.countDocuments();
    if (!orderCount) {
      return res
        .status(404)
        .send({ success: false, message: "No product found" });
    }
    return res.status(200).send({ orderCount: orderCount });
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

// Route to get the order of a specific user
router.get("/get/usersorders/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const userOrderList = await Order.find({ user: userId })
      .populate({
        path: "orderItems",
        populate: { path: "product", populate: "category" },
      })
      .sort({ dateOrdered: -1 });
    if (!userOrderList) {
      return res.status(404).send({ success: false, message: "No user found" });
    }
    return res.status(200).send(userOrderList);
  } catch (err) {
    return res.status(500).send({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
