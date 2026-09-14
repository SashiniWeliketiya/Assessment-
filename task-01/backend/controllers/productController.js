
const idempotencyStore = new Map();

exports.processPayment = async (req, res) => {
  const idempotencyKey = req.headers['idempotency-key'];

  
  if (!idempotencyKey) {
    return res.status(400).json({ 
      success: false, 
      message: 'Idempotency-Key header is required.' 
    });
  }


  if (idempotencyStore.has(idempotencyKey)) {
    const cachedResponse = idempotencyStore.get(idempotencyKey);
    
    if (cachedResponse.status === 'PROCESSING') {
      return res.status(409).json({ 
        success: false, 
        message: 'A payment request with this key is currently being processed. Please wait.' 
      });
    }

    
    return res.status(200).json(cachedResponse.data);
  }

  
  idempotencyStore.set(idempotencyKey, { status: 'PROCESSING' });

  try {
    const { items, totalAmount } = req.body;

    
    const successResponse = {
      success: true,
      transactionId: `TXN_${Date.now()}`,
      amount: totalAmount,
      message: 'Payment processed successfully!'
    };

    
    idempotencyStore.set(idempotencyKey, { 
      status: 'COMPLETED', 
      data: successResponse 
    });

    return res.status(200).json(successResponse);

  } catch (error) {
    idempotencyStore.delete(idempotencyKey);
    console.error('Payment Error:', error);

    return res.status(500).json({ 
      success: false, 
      message: 'Payment processing failed.', 
      error: error.message 
    });
  }
};