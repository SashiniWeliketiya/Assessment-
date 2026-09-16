import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

const Storefront = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, cart } = useCart();
  const navigate = useNavigate();

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(2000);
  const [inStockOnly, setInStockOnly] = useState(false);

  // Cart Notification (Toast) State
  const [notification, setNotification] = useState('');

  // Public folder image mapping
  const localImageMap = {
    'Gaming Laptop': '/images/laptop.jpg',
    'Wireless Mouse': '/images/mouse.jpg',
    'Mechanical Keyboard': '/images/keyboard.jpg',
    'Cotton T-Shirt': '/images/tshirt.jpg',
  };

  const fallbackImage = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80';

  useEffect(() => {
    fetchProducts();
    
    // Live update / re-check time cases every 10 seconds to keep timers accurate
    const timerInterval = setInterval(() => {
      setProducts(prevProducts => [...prevProducts]);
    }, 10000);

    return () => clearInterval(timerInterval);
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get('/products');
      
      let productData = [];
      if (Array.isArray(res.data)) {
        productData = res.data;
      } else if (res.data && Array.isArray(res.data.data)) {
        productData = res.data.data;
      } else if (res.data && Array.isArray(res.data.products)) {
        productData = res.data.products;
      }
      
      setProducts(productData);
    } catch (err) {
      console.error('Error fetching products:', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product, prodId) => {
    addToCart({ ...product, id: prodId });
    
    // Show success message notification
    setNotification(`"${product.name}" successfully added to cart!`);
    setTimeout(() => {
      setNotification('');
    }, 3000);
  };

  const safeProducts = Array.isArray(products) ? products : [];
  const categories = ['All', ...new Set(safeProducts.map(p => p?.category).filter(Boolean))];

  const filteredProducts = safeProducts.filter(product => {
    if (!product) return false;
    const name = product.name || '';
    const category = product.category || 'General';
    const price = Number(product.price) || 0;
    const stock = Number(product.stock) || 0;
    const reservedStock = Number(product.reservedStock) || 0;

    // 5 minutes expiry time case check for filtering
    let effectiveReserved = reservedStock;
    if (product.reservationExpiresAt && new Date(product.reservationExpiresAt) < new Date()) {
      effectiveReserved = 0;
    }

    const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || category === selectedCategory;
    const matchesPrice = price <= priceRange;
    const availableStock = stock - effectiveReserved;
    const matchesAvailability = !inStockOnly || availableStock > 0;

    return matchesSearch && matchesCategory && matchesPrice && matchesAvailability;
  });

  const cartItemCount = Array.isArray(cart) ? cart.reduce((total, item) => total + (item.quantity || 0), 0) : 0;

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#f8fafc', minHeight: '100vh', paddingBottom: '40px', position: 'relative' }}>
      
      {/* Toast Notification Banner */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          fontWeight: '600',
          transition: 'all 0.3s ease'
        }}>
          ✨ {notification}
        </div>
      )}

      {/* Top Header */}
      <div style={{
        backgroundColor: '#0f172a',
        color: '#ffffff',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '700', color: '#f8fafc' }}>Storefront</h2>
        <button
          onClick={() => navigate('/checkout')}
          style={{
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🛒 Cart ({cartItemCount})
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '0 20px' }}>
        
        {/* Search & Filter Bar */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          alignItems: 'end'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Search Product</label>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none', backgroundColor: '#fff' }}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600', color: '#334155' }}>
              Max Price: <span style={{ color: '#2563eb' }}>${priceRange}</span>
            </label>
            <input
              type="range"
              min="0"
              max="2000"
              step="10"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '8px' }}>
            <input
              type="checkbox"
              id="stockCheck"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <label htmlFor="stockCheck" style={{ fontSize: '14px', fontWeight: '600', color: '#334155', cursor: 'pointer' }}>In Stock Only</label>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '12px' }}>
            <p style={{ color: '#64748b', fontSize: '16px' }}>No products match your criteria.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '24px' }}>
            {filteredProducts.map(product => {
              const stock = Number(product.stock) || 0;
              const reservedStock = Number(product.reservedStock) || 0;
              
              
              let effectiveReserved = reservedStock;
              let isExpired = false;
              if (product.reservationExpiresAt) {
                const expiryTime = new Date(product.reservationExpiresAt);
                if (expiryTime < new Date()) {
                  isExpired = true;
                  effectiveReserved = 0;
                }
              }

              const availableStock = stock - effectiveReserved;
              const isAvailable = availableStock > 0;
              const displayImage = product.imageUrl || localImageMap[product.name] || fallbackImage;
              const prodId = product._id || product.id;

              return (
                <div
                  key={prodId || Math.random()}
                  onClick={() => navigate(`/product/${prodId}`)}
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ height: '180px', backgroundColor: '#f1f5f9', overflow: 'hidden' }}>
                    <img
                      src={displayImage}
                      alt={product.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                      }}
                    />
                  </div>

                  <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>
                        {product.category || 'General'}
                      </span>
                      <h3 style={{ margin: '6px 0 10px 0', fontSize: '18px', color: '#0f172a' }}>{product.name}</h3>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: '#1e293b', margin: '0 0 12px 0' }}>${product.price}</p>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '14px' }}>
                        <span style={{ color: '#64748b' }}>Availability:</span>
                        <span style={{ fontWeight: '600', color: isAvailable ? '#16a34a' : '#dc2626' }}>
                          {isAvailable ? `${availableStock} in stock` : 'Out of Stock'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation(); 
                          handleAddToCart(product, prodId);
                        }}
                        disabled={!isAvailable}
                        style={{
                          width: '100%',
                          backgroundColor: isAvailable ? '#0f172a' : '#cbd5e1',
                          color: '#ffffff',
                          border: 'none',
                          padding: '12px',
                          borderRadius: '8px',
                          fontWeight: '600',
                          cursor: isAvailable ? 'pointer' : 'not-allowed'
                        }}
                      >
                        {isAvailable ? 'Add to Cart' : 'Out of Stock'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Storefront;
