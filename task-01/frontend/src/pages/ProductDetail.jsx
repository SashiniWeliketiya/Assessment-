import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useCart } from '../context/CartContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Default short descriptions per category or general fallback
  const categoryDescriptions = {
    'Gaming Laptop': 'High-performance laptop engineered for modern gaming and intensive multitasking.',
    'Wireless Mouse': 'Ergonomic wireless mouse featuring fast precision tracking and long battery life.',
    'Mechanical Keyboard': 'Durable mechanical keyboard with tactile switches and customizable keycaps.',
    'Cotton T-Shirt': 'Premium soft cotton t-shirt designed for comfort and everyday wearability.'
  };

  const localImageMap = {
    'Gaming Laptop': '/images/laptop.jpg',
    'Wireless Mouse': '/images/mouse.jpg',
    'Mechanical Keyboard': '/images/keyboard.jpg',
    'Cotton T-Shirt': '/images/tshirt.jpg',
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data?.product || res.data?.data || res.data);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    try {
      if (addToCart && product) {
        addToCart(product);
        console.log('Added to cart successfully:', product.name);
        // අවශ්‍ය නම් කාට් එකට ගිය බව පෙන්වීමට alert එකක් හෝ notification එකක් තබාගත හැක
      } else {
        console.error('addToCart function or product is missing');
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Inter', sans-serif" }}>Loading product details...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '50px', fontFamily: "'Inter', sans-serif" }}>Product not found.</div>;

  const availableStock = (product.stock || 0) - (product.reservedStock || 0);
  const isAvailable = availableStock > 0;
  const displayImage = product.imageUrl || localImageMap[product.name] || fallbackImage;

  const displayDescription = product.description && product.description.trim() !== ''
    ? product.description
    : (categoryDescriptions[product.name] || 'High-quality item crafted with top materials for long-lasting performance and reliability.');

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        
        <button 
          onClick={() => navigate(-1)} 
          style={{ padding: '8px 16px', marginBottom: '20px', cursor: 'pointer', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff', color: '#0f172a', fontWeight: '600' }}
        >
          ← Back
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'center' }}>
          <img
            src={displayImage}
            alt={product.name}
            style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', maxHeight: '350px' }}
            onError={(e) => { 
              e.target.onerror = null;
              e.target.src = fallbackImage; 
            }}
          />

          <div>
            <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
              {product.category || 'General'}
            </span>
            <h2 style={{ fontSize: '28px', color: '#0f172a', margin: '8px 0' }}>{product.name}</h2>
            <p style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb', margin: '10px 0' }}>${product.price}</p>
            
            <p style={{ color: '#475569', lineHeight: '1.6', fontSize: '15px' }}>
              {displayDescription}
            </p>

            <div style={{ margin: '20px 0', fontSize: '15px' }}>
              <strong>Availability: </strong>
              <span style={{ color: isAvailable ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                {isAvailable ? `${availableStock} in stock` : 'Out of Stock'}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              style={{
                width: '100%',
                backgroundColor: isAvailable ? '#0f172a' : '#cbd5e1',
                color: '#ffffff',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '16px',
                cursor: isAvailable ? 'pointer' : 'not-allowed'
              }}
            >
              {isAvailable ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;