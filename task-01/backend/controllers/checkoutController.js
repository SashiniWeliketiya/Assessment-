const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createCheckoutSession = async (req, res) => {
  try {
    const { userId, items, idempotencyKey } = req.body;

    // 1. Check Idempotency Key
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({ idempotencyKey });
      if (existingOrder) {
        return res.status(200).json({ success: true, order: existingOrder });
      }
    }

    let totalAmount = 0;
    const orderItems = [];

    // 2. Validate items & update stock
    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const currentReserved = product.reservedStock || 0;
      const available = product.stock - currentReserved;

      if (available < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}` });
      }

      // Reserve stock
      product.reservedStock = currentReserved + item.quantity;
      await product.save();

      totalAmount += product.price * item.quantity;

      // Order Schema එකට ගැලපෙන ලෙස productId සහ price ලෙස යොදන්න
      orderItems.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price
      });
    }

    // 3. Create Order
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 Minutes Expiration
    const order = new Order({
      userId: userId || 'user_123',
      items: orderItems,
      totalAmount,
      idempotencyKey,
      expiresAt,
      status: 'PENDING_PAYMENT'
    });

    await order.save();
    res.status(201).json({ success: true, order });

  } catch (error) {
    console.error('Checkout Error Detail:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
};