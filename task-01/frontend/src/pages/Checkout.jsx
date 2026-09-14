import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState('');
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (cart && cart.length > 0) {
      cart.forEach(item => {
        if (!item.expiresAt) {
          item.expiresAt = new Date().getTime() + 5 * 60 * 1000;
        }
      });
    }
  }, [cart]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      if (cart && cart.length > 0) {
        cart.forEach(item => {
          if (item.expiresAt && now >= item.expiresAt) {
            removeFromCart(item.id || item._id);
            setNotification(`Item "${item.name}" was removed from cart due to 5-minute reservation timeout.`);
            setTimeout(() => setNotification(''), 4000);
          }
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cart, removeFromCart]);

  const totalAmount = Array.isArray(cart) 
    ? cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0) 
    : 0;

  const handlePlaceOrder = async () => {
    if (!cart || cart.length === 0) return;

    if (!cardNumber || !expiry || !cvv) {
      setNotification('Please fill in all payment details.');
      setTimeout(() => setNotification(''), 4000);
      return;
    }

    try {
      setLoading(true);
      setNotification('');

      const idempotencyKey = 'idempotency_' + Date.now() + '_' + Math.random();

      const paymentStatusOption = cardNumber.startsWith('4242') ? 'SUCCESS' : 'FAILED';

      const payRes = await API.post('/api/payments', {
        paymentStatus: paymentStatusOption,
        amount: totalAmount,
        idempotencyKey
      }).catch(async () => {
        return await API.post('/payments', {
          paymentStatus: paymentStatusOption,
          amount: totalAmount,
          idempotencyKey
        });
      });

      if (!payRes.data.success) {
        setNotification(payRes.data.message || 'Payment failed. Please check your card details.');
        setLoading(false);
        return;
      }

      const itemsPayload = cart.map(item => ({
        productId: item.id || item._id,
        id: item.id || item._id,
        quantity: Number(item.quantity) || 1,
        price: item.price
      }));

      const requestBody = {
        items: itemsPayload,
        cartItems: itemsPayload,
        products: itemsPayload,
        totalAmount,
        idempotencyKey
      };

      let response;
      try {
        response = await API.post('/api/orders', requestBody);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          response = await API.post('/orders', requestBody);
        } else {
          throw err;
        }
      }

      setSuccessModal(true);
      if (typeof clearCart === 'function') clearCart();

    } catch (err) {
      console.error('Order processing error:', err);
      let errorMsg = 'Order processing failed.';
      if (err.response) {
        errorMsg = err.response.data?.message || err.response.data?.error || `Server Error (${err.response.status})`;
      } else {
        errorMsg = err.message || 'Network error occurred.';
      }
      setNotification(errorMsg);
      setTimeout(() => setNotification(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 20px', position: 'relative' }}>
      
      {notification && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', backgroundColor: '#ef4444',
          color: '#ffffff', padding: '12px 20px', borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', zIndex: 1000, fontWeight: '600', maxWidth: '400px'
        }}>
          ⚠️ {notification}
          <button onClick={() => setNotification('')} style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {successModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000
        }}>
          <div style={{
            backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px',
            textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', maxWidth: '400px', width: '90%'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '15px' }}>🎉</div>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>Order Placed Successfully!</h3>
            <p style={{ margin: '0 0 25px 0', fontSize: '14px', color: '#64748b' }}>Your 5-minute stock hold was secured and order processed.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { setSuccessModal(false); navigate('/'); }}
                style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}
              >
                Storefront
              </button>
              <button
                onClick={() => { setSuccessModal(false); navigate('/orders'); }}
                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', flex: 1 }}
              >
                View History
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <button
            onClick={() => navigate('/')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '14px' }}
          >
            ← Back to Store
          </button>
          <div style={{ fontSize: '14px', fontWeight: '600', color: timeLeft > 60 ? '#16a34a' : '#dc2626' }}>
            Hold expires in: {formatTime(timeLeft)}
          </div>
          <button
            onClick={() => navigate('/orders')}
            style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', color: '#0f172a', padding: '6px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            📜 View Order History
          </button>
        </div>

        <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          Shopping Cart & Checkout
        </h2>

        <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: '600', fontSize: '14px', color: '#334155' }}>Payment Information (Tip: Start card with 4242 for success):</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="text"
              placeholder="Card Number (e.g., 4242 4242 4242 4242)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', flex: 1 }}
              />
              <input
                type="password"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', flex: 1 }}
              />
            </div>
          </div>
        </div>

        {!cart || cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
            <p style={{ fontSize: '16px' }}>Your cart is empty.</p>
          </div>
        ) : (
          <div>
            {cart.map(item => {
              const itemId = item.id || item._id;
              return (
                <CartItemRow 
                  key={itemId} 
                  item={item} 
                  itemId={itemId} 
                  updateQuantity={updateQuantity} 
                  removeFromCart={removeFromCart} 
                />
              );
            })}

            <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a' }}>Total Amount:</h3>
              <h3 style={{ margin: 0, fontSize: '22px', color: '#2563eb' }}>${totalAmount.toFixed(2)}</h3>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={loading || timeLeft === 0}
              style={{
                width: '100%', marginTop: '25px', backgroundColor: loading || timeLeft === 0 ? '#94a3b8' : '#16a34a',
                color: 'white', border: 'none', padding: '14px', borderRadius: '8px',
                fontSize: '16px', fontWeight: '700', cursor: loading || timeLeft === 0 ? 'not-allowed' : 'pointer', textAlign: 'center'
              }}
            >
              {loading ? 'Processing Payment & Stock...' : 'Complete Payment & Place Order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CartItemRow = ({ item, itemId, updateQuantity, removeFromCart }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      if (!item.expiresAt) return;
      const remaining = item.expiresAt - new Date().getTime();
      if (remaining <= 0) {
        setTimeLeft('Expired');
      } else {
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    };
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [item.expiresAt]);

  const currentQty = Number(item.quantity) || 1;

  const handleDecrease = () => {
    if (currentQty > 1) {
      updateQuantity(itemId, currentQty - 1);
    }
  };

  const handleIncrease = () => {
    updateQuantity(itemId, currentQty + 1);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #f1f5f9' }}>
      <div>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', color: '#1e293b' }}>{item.name}</h4>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>${item.price} each</p>
        <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: '600' }}>
          ⏳ Hold expires in: {timeLeft}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden' }}>
          <button
            onClick={handleDecrease}
            style={{ background: '#f8fafc', border: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}
          >
            -
          </button>
          <span style={{ padding: '0 12px', fontSize: '14px', fontWeight: '600', minWidth: '30px', textAlign: 'center' }}>{currentQty}</span>
          <button
            onClick={handleIncrease}
            style={{ background: '#f8fafc', border: 'none', padding: '6px 12px', cursor: 'pointer', fontWeight: '600' }}
          >
            +
          </button>
        </div>

        <span style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', width: '80px', textAlign: 'right' }}>
          ${(Number(item.price) || 0) * currentQty}
        </span>

        <button
          onClick={() => removeFromCart(itemId)}
          style={{ backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default Checkout;