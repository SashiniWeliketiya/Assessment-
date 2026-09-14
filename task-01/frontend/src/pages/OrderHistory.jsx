import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState('');
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      let res;
      try {
        res = await API.get('/api/orders');
      } catch (err) {
        res = await API.get('/orders');
      }
      setOrders(res.data.orders || res.data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setNotification('Could not load order history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order and process a refund?')) return;
    try {
      try {
        await API.post(`/api/orders/${orderId}/cancel`);
      } catch (err) {
        await API.post(`/orders/${orderId}/cancel`);
      }
      
      setNotification('Order cancelled and refunded successfully!');
      fetchOrders();
    } catch (err) {
      console.error('Error cancelling order:', err);
      setNotification(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', padding: '30px 20px' }}>
      {notification && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', backgroundColor: '#334155', color: '#ffffff', padding: '12px 20px', borderRadius: '8px', zIndex: 1000, fontWeight: '600', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {notification}
          <button onClick={() => setNotification('')} style={{ marginLeft: '10px', background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
          <button
            onClick={() => navigate('/checkout')}
            style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: '600', cursor: 'pointer', padding: 0, fontSize: '14px' }}
          >
            ← Back to Checkout
          </button>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Order History & Refunds</h2>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>Loading past orders...</p>
        ) : orders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#64748b', padding: '40px' }}>No past orders found.</p>
        ) : (
          <div>
            {orders.map((ord, idx) => (
              <div key={ord._id || idx} style={{ padding: '18px', marginBottom: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#fdfdfd' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: '600', color: '#1e293b', marginBottom: '8px' }}>
                  <span>Order ID: {ord._id}</span>
                  <span style={{ color: '#16a34a' }}>${ord.totalAmount?.toFixed(2)}</span>
                </div>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>Date: {new Date(ord.createdAt || Date.now()).toLocaleString()}</p>
                
                <div style={{ margin: '10px 0', padding: '10px', backgroundColor: '#f1f5f9', borderRadius: '6px' }}>
                  <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '700', color: '#334155' }}>Items:</p>
                  {ord.orderItems?.map((item, itemIdx) => {
                    const productName = item.product?.name || 'Product';
                    const productPrice = item.product?.price || item.price || 0;
                    return (
                      <div key={itemIdx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '3px' }}>
                        <span>{productName} (Qty: {item.quantity})</span>
                        <span>${(productPrice * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <div style={{ fontSize: '13px', color: '#475569' }}>
                    Status: <span style={{ fontWeight: '600', color: ord.status === 'Cancelled' ? '#dc2626' : '#2563eb' }}>{ord.status || 'Processing'}</span>
                    {ord.paymentStatus === 'REFUNDED' && <span style={{ marginLeft: '10px', fontSize: '11px', backgroundColor: '#fee2e2', color: '#991b1b', padding: '2px 6px', borderRadius: '4px' }}>Refunded</span>}
                  </div>

                  {ord.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancelOrder(ord._id)}
                      style={{ backgroundColor: '#ef4444', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      Cancel & Refund
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;