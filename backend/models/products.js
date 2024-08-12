const mongoose = require('mongoose')

const {Schema} = mongoose;

const productSchema = new Schema({
    name: {type: String, required: true},
    image: String,
    countInStock: Number
})

const Product = mongoose.model('Product', productSchema);
module.exports = Product;