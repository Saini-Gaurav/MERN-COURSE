const express = require("express");

const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");

require("dotenv/config");

const api = process.env.API_URL;

//Middleware
app.use(express.json());
app.use(morgan("tiny"));

app.get(`${api}/products`, (req, res) => {
  const product = {
    id: 1,
    name: "Iphone 14",
    image: "some-url",
    price: 55000,
  };
  res.send(product);
});

app.post(`${api}/products`, (req, res) => {
  const newProduct = req.body;
  console.log(newProduct);
  res.send(newProduct);
});

mongoose
  .connect(process.env.CONNECTION_STRING)
  .then(() => {
    console.log("Database connection is ready");
  })
  .catch((err) => {
    console.log("Error: ", err);
  });
app.listen(3000, () => {
  console.log("Server is runinng on port http://localhost:3000");
});
