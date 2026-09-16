const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: false 
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true }
    }
  ],
  totalAmount: { type: Number, required: true },
  paymentStatus: { type: String, default: 'SUCCESS' },
  status: { 
    type: String, 
    enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], 
    default: 'Processing' 
  },
  idempotencyKey: { 
    type: String, 
    unique: true, 
    sparse: true 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
