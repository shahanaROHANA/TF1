import React, { useState, useEffect } from 'react';
import SellerProfile from './seller/SellerProfile';
import MenuManagement from './seller/MenuManagement';
import OrderHandling from './seller/OrderHandling';
import TrainAssignment from './seller/TrainAssignment';
import RevenuePayments from './seller/RevenuePayments';
import Notifications from './seller/Notifications';
import RatingsFeedback from './seller/RatingsFeedback';
import SellerAnalytics from './seller/SellerAnalytics';
import './SellerDashboard.css';

const SellerDashboard = ({ seller, user }) => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellerProfile();
  }, []);

  const fetchSellerProfile = async () => {
    try {
      const token = seller ? localStorage.getItem('sellerToken') : localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seller/dashboard/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSellerData(data);
      }
    } catch (error) {
      console.error('Error fetching seller profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <SellerProfile sellerData={sellerData} onUpdate={fetchSellerProfile} />;
      case 'add-product':
        return <MenuManagement mode="add" />;
      case 'my-products':
        return <MenuManagement mode="list" />;
      case 'orders':
        return <OrderHandling />;
      case 'trains':
        return <TrainAssignment />;
      case 'revenue':
        return <RevenuePayments />;
      case 'notifications':
        return <Notifications />;
      case 'ratings':
        return <RatingsFeedback />;
      case 'analytics':
        return <SellerAnalytics onTabChange={setActiveTab} />;
      default:
        return <SellerProfile sellerData={sellerData} onUpdate={fetchSellerProfile} />;
    }
  };

  if (loading) {
    return (
      <div className="seller-dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="seller-dashboard">
      <div className="dashboard-header">
        <h1>🍱 {sellerData?.restaurantName || 'Seller Dashboard'}</h1>
        <div className="header-info">
          <span className="station-info">📍 {sellerData?.station}</span>
          <span className={`status-badge ${sellerData?.isActive ? 'active' : 'inactive'}`}>
            {sellerData?.isActive ? '🟢 Active' : '🔴 Inactive'}
          </span>
        </div>
      </div>

      <div className="dashboard-container">
        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3>📊 Dashboard</h3>
            <button 
              className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
              onClick={() => setActiveTab('analytics')}
            >
              📈 Analytics
            </button>
          </div>

          <div className="nav-section">
            <h3>👤 Account</h3>
            <button 
              className={`nav-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              📝 Profile Management
            </button>
          </div>

          <div className="nav-section">
            <h3>🍽️ Menu</h3>
            <button
              className={`nav-btn ${activeTab === 'add-product' ? 'active' : ''}`}
              onClick={() => setActiveTab('add-product')}
            >
              ➕ Add Product
            </button>
            <button
              className={`nav-btn ${activeTab === 'my-products' ? 'active' : ''}`}
              onClick={() => setActiveTab('my-products')}
            >
              📦 My Products
            </button>
          </div>

          <div className="nav-section">
            <h3>📦 Orders</h3>
            <button 
              className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              🚚 Order Handling
            </button>
          </div>

          <div className="nav-section">
            <h3>🚆 Trains</h3>
            <button 
              className={`nav-btn ${activeTab === 'trains' ? 'active' : ''}`}
              onClick={() => setActiveTab('trains')}
            >
              🎫 Train Assignment
            </button>
          </div>

          <div className="nav-section">
            <h3>💰 Revenue</h3>
            <button 
              className={`nav-btn ${activeTab === 'revenue' ? 'active' : ''}`}
              onClick={() => setActiveTab('revenue')}
            >
              💳 Revenue & Payments
            </button>
          </div>

          <div className="nav-section">
            <h3>🔔 Communication</h3>
            <button 
              className={`nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              📬 Notifications
            </button>
          </div>

          <div className="nav-section">
            <h3>⭐ Feedback</h3>
            <button 
              className={`nav-btn ${activeTab === 'ratings' ? 'active' : ''}`}
              onClick={() => setActiveTab('ratings')}
            >
              📝 Ratings & Feedback
            </button>
          </div>
        </nav>

        <main className="main-content">
          {renderTabContent()}
        </main>
      </div>
    </div>
  );
};

export default SellerDashboard;
