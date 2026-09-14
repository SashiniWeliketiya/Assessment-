const express = require('express');
const router = express.Router();
const { createCheckoutSession } = require('../controllers/checkoutController');

router.post('/', createCheckoutSession);

module.exports = router;