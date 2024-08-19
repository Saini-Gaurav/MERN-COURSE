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
      totalPrice: req.body.totalPrice,
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

module.exports = router;
