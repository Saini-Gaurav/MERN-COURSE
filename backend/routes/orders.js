const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-items");
const router = express.Router();

// Route to get all the orders
router.get(`/`, async (req, res) => {
  try {
    const orderList = await Order.find();

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

// Route to create a order
router.post("/", async (req, res) => {
  const orderItemsIds = Promise.all(req.body.orderItems.map(async (orderItem) => {
    let newOrderItem = new OrderItem({
      quantity: orderItem.quantity,
      product: orderItem.product,
    });
    newOrderItem = await newOrderItem.save();
    return newOrderItem._id;
  }));
  
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

module.exports = router;
