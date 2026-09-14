const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techloom-ecommerce';

const sampleProducts = [
  { name: 'Gaming Laptop', category: 'Electronics', price: 1200, stock: 10 },
  { name: 'Wireless Mouse', category: 'Electronics', price: 25, stock: 50 },
  { name: 'Mechanical Keyboard', category: 'Electronics', price: 85, stock: 20 },
  { name: 'Cotton T-Shirt', category: 'Clothing', price: 15, stock: 100 }
];

mongoose.connect(MONGO_URI)
  .then(async () => {
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);
    console.log('Sample Products Added Successfully!');
    process.exit();
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });