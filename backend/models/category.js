const mongoose = require('mongoose');

const { Schema } = mongoose;

const categorySchema = new Schema({

});

exports.Category = mongoose.model('Category', categorySchema);