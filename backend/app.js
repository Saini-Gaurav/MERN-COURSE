const express = require("express");

const app = express();
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require('cors');
require("dotenv/config");
const authJwt = require('./helper/jwt')
const errorHandler = require('./helper/error-handler')

app.use(cors());
app.options('*', cors());

// Routes
const categoriesRoutes = require('./routes/categories')
const productsRoutes = require('./routes/products')
const ordersRoutes = require('./routes/orders');
const usersRoutes = require('./routes/users')



const api = process.env.API_URL;

//Middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use('/public/uploads/', express.static(__dirname + '/public/uploads/'));
app.use(errorHandler)

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/users`, usersRoutes);

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
