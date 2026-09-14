import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Storefront from './pages/Storefront'; 
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<OrderHistory />} />
      </Routes>
    </Router>
  );
}

export default App;