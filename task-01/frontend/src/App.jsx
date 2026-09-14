import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Storefront from './pages/Storefront'; 
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import ProductDetail from './pages/ProductDetail'; // 1. මෙතනින් import කරන්න

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/product/:id" element={<ProductDetail />} /> {/* 2. මෙන්න මේ line එක අලුතින් දාන්න */}
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderHistory />} />
      </Routes>
    </Router>
  );
}

export default App;