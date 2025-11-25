import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import StationMenu from './components/StationMenu';
import StationSearch from './components/StationSearch';
import Cart from './components/Cart';
import AdminDashboard from './components/AdminDashboard';
import SellerDashboard from './components/SellerDashboard';
import SellerLogin from './components/SellerLogin';
import DeliveryLogin from './components/DeliveryLogin';
import DeliveryDashboard from './components/DeliveryDashboard';
import OrderTracking from './components/OrderTracking';
import TrainSchedule from './components/TrainSchedule';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    // Check if user is logged in on app load
    const storedUser = localStorage.getItem('user');
    const storedSeller = localStorage.getItem('seller');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedSeller) {
      setSeller(JSON.parse(storedSeller));
    }

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const userParam = urlParams.get('user');
    const oauth = urlParams.get('oauth');

    if (token && userParam && oauth === 'google') {
      try {
        const userData = JSON.parse(decodeURIComponent(userParam));
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Redirect to products page
        window.location.href = '/products';
      } catch (error) {
        console.error('Error parsing OAuth data:', error);
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = (userData) => {
    setUser(userData);
  };

  const handleSellerLogin = (sellerData) => {
    setSeller(sellerData);
  };

  const handleLogout = () => {
    setUser(null);
    setSeller(null);
  };

  const handleCheckout = (totalAmount) => {
    alert(`Checkout functionality would be implemented here. Total: ₹${totalAmount.toFixed(2)}`);
    // In a real app, this would navigate to a payment page
  };

  return (
    <Router>
      <div className="app">
        <Navigation user={user} seller={seller} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={seller ? <SellerDashboard seller={seller} user={user} /> : <Home />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/seller-login" element={<SellerLogin onSellerLogin={handleSellerLogin} />} />
            <Route path="/register" element={<Register onRegister={handleRegister} />} />
            <Route path="/station-search" element={<StationSearch />} />
            <Route path="/products" element={<StationMenu onAddToCart={() => {}} />} />
            <Route path="/cart" element={<Cart onCheckout={handleCheckout} />} />
            <Route path="/orders" element={user ? <OrderTracking /> : <Navigate to="/login" replace />} />
            <Route path="/orders/:id" element={user ? <OrderTracking /> : <Navigate to="/login" replace />} />
            <Route path="/orders/:id/tracking" element={user ? <TrainSchedule /> : <Navigate to="/login" replace />} />
            <Route path="/vendors" element={<Home />} />
            <Route path="/about" element={<Home />} />
            <Route path="/contact" element={<Home />} />
            <Route 
              path="/admin/*" 
              element={
                user?.role === 'admin' ? 
                <AdminDashboard user={user} onLogout={handleLogout} /> : 
                <Navigate to="/login" replace />
              } 
            />
            <Route
              path="/seller/*"
              element={
                seller || user?.role === 'seller' ?
                  <SellerDashboard seller={seller} user={user} onLogout={handleLogout} /> :
                  <Navigate to="/login" replace />
              }
            />
            <Route 
              path="/delivery/login" 
              element={<DeliveryLogin />} 
            />
            <Route 
              path="/delivery/dashboard" 
              element={
                user?.role === 'deliveryAgent' || localStorage.getItem('deliveryToken') ? 
                <DeliveryDashboard /> : 
                <Navigate to="/delivery/login" replace />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
