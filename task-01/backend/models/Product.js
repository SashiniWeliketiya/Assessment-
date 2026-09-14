const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, default: 'General' },
  stock: { type: Number, default: 10 },
  description: { type: String, default: '' }
});

module.exports = mongoose.model('Product', productSchema);