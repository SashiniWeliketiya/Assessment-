const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  try {
    let products = await Product.find({});
    if (products.length === 0) {
      const sampleProducts = [
        { name: 'Wireless Mouse', price: 25, category: 'Electronics', stock: 15, description: 'Ergonomic wireless mouse' },
        { name: 'Mechanical Keyboard', price: 75, category: 'Electronics', stock: 10, description: 'RGB mechanical keyboard' },
        { name: 'USB-C Hub', price: 40, category: 'Accessories', stock: 20, description: 'Multiport adapter' }
      ];
      await Product.insertMany(sampleProducts);
      products = await Product.find({});
    }
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;