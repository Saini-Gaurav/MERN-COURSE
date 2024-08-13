const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({
    name: {type: String, required: true},
    icon: {type: String},
    color: {type: String}

});

exports.Category = mongoose.model('Category', categorySchema);