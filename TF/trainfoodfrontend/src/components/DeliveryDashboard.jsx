import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeliveryHeader from './delivery/DeliveryHeader';
import ActiveDeliveryCard from './delivery/ActiveDeliveryCard';
import AvailableOrdersList from './delivery/AvailableOrdersList';
import DeliveryEarnings from './delivery/DeliveryEarnings';
import DeliveryHistory from './delivery/DeliveryHistory';
import IncomingJobModal from './delivery/IncomingJobModal';
import './DeliveryDashboard.css';

const DeliveryDashboard = () => {
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [incomingJob, setIncomingJob] = useState(null);
  const [showIncomingModal, setShowIncomingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Fetch delivery profile and data
  useEffect(() => {
    fetchDeliveryProfile();
    fetchAvailableOrders();
    fetchEarnings();
    fetchOrderHistory();
    
    // Set up polling for new orders
    const orderPollInterval = setInterval(fetchAvailableOrders, 30000); // Check every 30 seconds
    
    return () => clearInterval(orderPollInterval);
  }, []);

  const fetchDeliveryProfile = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      if (!token) {
        navigate('/delivery/login');
        return;
      }

      const response = await fetch('/api/delivery/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryInfo(data);
        
        // Check for active order
        if (data.activeOrderId) {
          fetchActiveOrder(data.activeOrderId);
        }
      } else if (response.status === 401) {
        localStorage.removeItem('deliveryToken');
        localStorage.removeItem('deliveryInfo');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/delivery/login');
      } else {
        setError('Failed to fetch profile');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const order = await response.json();
        setActiveOrder(order);
      }
    } catch (err) {
      console.error('Failed to fetch active order:', err);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch('/api/delivery/orders/available', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const orders = await response.json();
        setAvailableOrders(orders);
        
        // Check for new orders and show modal
        if (orders.length > 0 && !incomingJob) {
          const newOrder = orders[0]; // Get the latest order
          setIncomingJob(newOrder);
          setShowIncomingModal(true);
        }
      }
    } catch (err) {
      console.error('Failed to fetch available orders:', err);
    }
  };

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch('/api/delivery/earnings?period=today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEarnings(data);
      }
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch('/api/delivery/orders/my?period=today', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const orders = await response.json();
        setOrderHistory(orders.filter(order => order.status === 'DELIVERED'));
      }
    } catch (err) {
      console.error('Failed to fetch order history:', err);
    }
  };

  const updateAvailability = async (available) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch('/api/delivery/availability', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available })
      });

      if (response.ok) {
        const data = await response.json();
        setDeliveryInfo(prev => ({
          ...prev,
          isAvailable: data.isAvailable
        }));
      }
    } catch (err) {
      setError('Failed to update availability');
    }
  };

  const acceptOrder = async (orderId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch('/api/delivery/orders/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveOrder(data.order);
        setShowIncomingModal(false);
        setIncomingJob(null);
        fetchAvailableOrders(); // Refresh available orders
        fetchDeliveryProfile(); // Refresh profile
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to accept order');
      }
    } catch (err) {
      setError('Network error while accepting order');
    } finally {
      setLoading(false);
    }
  };

  const declineOrder = async (orderId, reason) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch('/api/delivery/orders/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId, reason })
      });

      if (response.ok) {
        setShowIncomingModal(false);
        setIncomingJob(null);
        fetchAvailableOrders(); // Refresh available orders
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to decline order');
      }
    } catch (err) {
      setError('Network error while declining order');
    }
  };

  const updateOrderStatus = async (status, proof = null, station = null) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('deliveryToken');
      const response = await fetch('/api/delivery/orders/status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          orderId: activeOrder._id, 
          status, 
          proof, 
          station 
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActiveOrder(prev => ({
          ...prev,
          status: data.order.status,
          timestamps: data.order.timestamps
        }));

        if (status === 'DELIVERED') {
          setActiveOrder(null);
          fetchEarnings();
          fetchOrderHistory();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Network error while updating status');
    }
  };

  const logout = () => {
    localStorage.removeItem('deliveryToken');
    localStorage.removeItem('deliveryInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/delivery/login');
  };

  if (loading) {
    return (
      <div className="delivery-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="delivery-dashboard">
      <DeliveryHeader 
        deliveryInfo={deliveryInfo}
        onToggleAvailability={updateAvailability}
        onLogout={logout}
      />

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="delivery-content">
        <div className="delivery-main">
          {activeOrder ? (
            <ActiveDeliveryCard 
              order={activeOrder}
              onUpdateStatus={updateOrderStatus}
            />
          ) : (
            <AvailableOrdersList 
              orders={availableOrders}
              onAcceptOrder={acceptOrder}
              onDeclineOrder={declineOrder}
            />
          )}
        </div>

        <div className="delivery-sidebar">
          <DeliveryEarnings earnings={earnings} />
          <DeliveryHistory orders={orderHistory} />
        </div>
      </div>

      {showIncomingModal && incomingJob && (
        <IncomingJobModal 
          order={incomingJob}
          onAccept={() => acceptOrder(incomingJob._id)}
          onDecline={(reason) => declineOrder(incomingJob._id, reason)}
          onClose={() => {
            setShowIncomingModal(false);
            setIncomingJob(null);
          }}
        />
      )}
    </div>
  );
};

export default DeliveryDashboard;
