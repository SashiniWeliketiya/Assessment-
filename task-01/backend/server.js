const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const startCronJobs = require('./utils/cronJobs');

const productRoutes = require('./routes/productRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


app.get('/', (req, res) => {
  res.send('E-Commerce Backend is Running Successfully!');
});

// API Routes
app.use('/api/products', productRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);


const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/techloom-ecommerce';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected');
    startCronJobs();
    
    
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    }
  })
  .catch(err => console.error('DB Connection Error:', err));


module.exports = app;