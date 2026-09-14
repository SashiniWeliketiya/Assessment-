const crypto = require('crypto');

const processPayment = async (req, res) => {
  try {
    const { paymentStatus, amount, idempotencyKey } = req.body;
    const clientKey = idempotencyKey || req.headers['idempotency-key'] || crypto.randomBytes(16).toString('hex');

    if (paymentStatus === 'FAILED') {
      return res.status(400).json({ success: false, message: 'Payment failed. Please try again.' });
    }

    if (paymentStatus === 'TIMEOUT') {
      return res.status(408).json({ success: false, message: 'Payment gateway timeout. Please retry.' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      transactionId: crypto.randomBytes(8).toString('hex'),
      idempotencyKey: clientKey
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { processPayment };