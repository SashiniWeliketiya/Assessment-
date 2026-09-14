const cron = require('node-cron');
const Order = require('../models/Order');
const Product = require('../models/Product');

const startCronJobs = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const expiredOrders = await Order.find({
        status: 'PENDING_PAYMENT',
        reservationExpiresAt: { $lt: new Date() }
      });

      for (const order of expiredOrders) {
        order.status = 'CANCELLED';
        await order.save();

        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { reservedStock: -item.quantity }
          });
        }
      }
    } catch (error) {
      console.error('Cron job error:', error.message);
    }
  });
};

module.exports = startCronJobs;