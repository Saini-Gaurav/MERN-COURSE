const mongoose = require('mongoose')

const {Schema} = mongoose;

const userSchema = new Schema({
    name: {type: String, required: true},
    image: String,
    countInStock: Number
})

exports.User = mongoose.model('User', userSchema);
