const Order = require('../models/Order');
const Product = require('../models/Product');
const crypto = require('crypto');

const createOrder = async (req, res) => {
  try {
    const { items, cartItems, products, totalAmount, idempotencyKey } = req.body;
    const orderItems = items || cartItems || products;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No items provided in the order' });
    }

    for (const item of orderItems) {
      const productId = item.productId || item.id || item.product;
      const quantity = item.quantity || 1;

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

      if (product.stock < quantity) {
        return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
      }

      product.stock -= quantity;
      await product.save();
    }

    const uniqueKey = idempotencyKey || crypto.randomBytes(16).toString('hex');

    const order = new Order({
      orderItems: orderItems.map(item => ({
        product: item.productId || item.id || item.product,
        quantity: item.quantity || 1,
        price: item.price || 0
      })),
      totalAmount,
      paymentStatus: 'SUCCESS',
      status: 'Processing',
      idempotencyKey: uniqueKey
    });

    const createdOrder = await order.save();
    res.status(201).json({ message: 'Order placed successfully and stock updated', createdOrder });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: error.message || 'Server error while placing order' });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate({
        path: 'orderItems.product',
        select: 'name price category'
      })
      .sort({ createdAt: -1 });
      
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'Cancelled') {
      return res.status(400).json({ message: 'Order is already cancelled' });
    }

    for (const item of order.orderItems) {
      const productId = item.product?._id || item.product;
      const product = await Product.findById(productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'Cancelled';
    order.paymentStatus = 'REFUNDED';
    await order.save();

    res.status(200).json({ message: 'Order cancelled and refund processed successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: error.message || 'Server error while cancelling order' });
  }
};

module.exports = { createOrder, getOrders, cancelOrder };