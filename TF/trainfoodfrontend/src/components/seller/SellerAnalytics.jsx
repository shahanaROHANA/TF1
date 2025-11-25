import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SellerAnalytics = ({ onTabChange }) => {
  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('sellerToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seller/dashboard/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setMessage('Error loading analytics data');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (cents) => {
    return `₹${(cents / 100).toFixed(2)}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getGrowthIndicator = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, isPositive: true };
    const growth = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(growth).toFixed(1),
      isPositive: growth >= 0
    };
  };

  if (loading) {
    return (
      <div className="seller-analytics">
        <div className="card">
          <div className="text-center p-4">
            <div className="loading-spinner"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="seller-analytics">
      {/* Modern Header */}
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="analytics-title">📊 Analytics Dashboard</h1>
          <p className="analytics-subtitle">Track your restaurant's performance and growth</p>
        </div>
        <div className="period-selector">
          <select
            className="period-select"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="daily">📅 Daily</option>
            <option value="weekly">📊 Weekly</option>
            <option value="monthly">📈 Monthly</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-error'}`}>
          {message}
        </div>
      )}

      {analytics && (
        <>
          {/* Key Performance Indicators */}
          <div className="kpi-section">
            <h2 className="section-title">📈 Key Metrics</h2>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">🍽️</div>
                <div className="kpi-content">
                  <h3 className="kpi-value">{analytics.totalProducts || 0}</h3>
                  <p className="kpi-label">Total Products</p>
                  <span className="kpi-trend positive">+12%</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">📦</div>
                <div className="kpi-content">
                  <h3 className="kpi-value">{analytics.totalOrders}</h3>
                  <p className="kpi-label">Total Orders</p>
                  <span className="kpi-trend positive">+8%</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">⏳</div>
                <div className="kpi-content">
                  <h3 className="kpi-value">{analytics.pendingOrders || 0}</h3>
                  <p className="kpi-label">Pending Orders</p>
                  <span className="kpi-trend warning">-3%</span>
                </div>
              </div>

              <div className="kpi-card">
                <div className="kpi-icon">✅</div>
                <div className="kpi-content">
                  <h3 className="kpi-value">{analytics.completedOrders || 0}</h3>
                  <p className="kpi-label">Completed Orders</p>
                  <span className="kpi-trend positive">+15%</span>
                </div>
              </div>

              <div className="kpi-card featured">
                <div className="kpi-icon">💰</div>
                <div className="kpi-content">
                  <h3 className="kpi-value">{formatCurrency(analytics.totalRevenue / 100)}</h3>
                  <p className="kpi-label">Total Revenue</p>
                  <span className="kpi-trend positive">+22%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="chart-section">
            <h2 className="section-title">💰 Revenue Trends</h2>
            <div className="chart-container">
              <div className="chart-header">
                <div className="chart-legend">
                  <span className="legend-item">● Revenue</span>
                  <span className="legend-item">■ Orders</span>
                </div>
              </div>
              <div className="chart-content">
                <div className="chart-placeholder">
                  <div className="chart-icon">📊</div>
                  <p>Revenue chart visualization</p>
                  <small>Data visualization coming soon</small>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="products-section">
            <h2 className="section-title">🏆 Best Performing Products</h2>
            <div className="products-table-container">
              {analytics.topProducts?.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📊</div>
                  <h3>No sales data yet</h3>
                  <p>Start receiving orders to see your top products here</p>
                </div>
              ) : (
                <div className="products-table">
                  <div className="table-header">
                    <div className="table-cell">Product Name</div>
                    <div className="table-cell">Units Sold</div>
                    <div className="table-cell">Revenue</div>
                    <div className="table-cell">Performance</div>
                  </div>
                  {analytics.topProducts?.map((product, index) => (
                    <div key={index} className="table-row">
                      <div className="table-cell product-name">
                        <span className="product-icon">🍽️</span>
                        {product.name}
                      </div>
                      <div className="table-cell">{product.quantity}</div>
                      <div className="table-cell revenue">{formatPrice(product.revenue)}</div>
                      <div className="table-cell">
                        <span className="performance-badge positive">Top Seller</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="actions-section">
            <h2 className="section-title">⚡ Quick Actions</h2>
            <div className="actions-grid">
              <button
                className="action-card"
                onClick={() => onTabChange && onTabChange('add-product')}
              >
                <div className="action-icon">➕</div>
                <div className="action-content">
                  <h4>Add New Product</h4>
                  <p>Expand your menu</p>
                </div>
              </button>

              <button
                className="action-card"
                onClick={() => onTabChange && onTabChange('orders')}
              >
                <div className="action-icon">📦</div>
                <div className="action-content">
                  <h4>View Orders</h4>
                  <p>Manage your orders</p>
                </div>
              </button>

              <button
                className="action-card"
                onClick={() => onTabChange && onTabChange('ratings')}
              >
                <div className="action-icon">⭐</div>
                <div className="action-content">
                  <h4>Customer Feedback</h4>
                  <p>Read reviews & ratings</p>
                </div>
              </button>

              <button
                className="action-card"
                onClick={() => onTabChange && onTabChange('profile')}
              >
                <div className="action-icon">⚙️</div>
                <div className="action-content">
                  <h4>Settings</h4>
                  <p>Manage your profile</p>
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .seller-analytics {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
          background: #f8fafc;
          min-height: 100vh;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .header-content h1 {
          margin: 0;
          font-size: 2.5rem;
          font-weight: 700;
          color: #1a202c;
        }

        .analytics-subtitle {
          margin: 0.5rem 0 0 0;
          color: #718096;
          font-size: 1.1rem;
        }

        .period-selector {
          display: flex;
          align-items: center;
        }

        .period-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: white;
          font-size: 1rem;
          font-weight: 500;
          color: #4a5568;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .period-select:hover {
          border-color: #4299e1;
        }

        .period-select:focus {
          outline: none;
          border-color: #4299e1;
          box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .kpi-section {
          margin-bottom: 2rem;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .kpi-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
          border: 2px solid transparent;
        }

        .kpi-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .kpi-card.featured {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .kpi-card.featured .kpi-trend {
          background: rgba(255, 255, 255, 0.2);
          color: white;
        }

        .kpi-icon {
          font-size: 3rem;
          opacity: 0.8;
        }

        .kpi-content {
          flex: 1;
        }

        .kpi-value {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: #2d3748;
        }

        .kpi-card.featured .kpi-value {
          color: white;
        }

        .kpi-label {
          margin: 0 0 0.5rem 0;
          color: #718096;
          font-size: 1rem;
          font-weight: 500;
        }

        .kpi-card.featured .kpi-label {
          color: rgba(255, 255, 255, 0.9);
        }

        .kpi-trend {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .kpi-trend.positive {
          background: #c6f6d5;
          color: #22543d;
        }

        .kpi-trend.warning {
          background: #fed7d7;
          color: #742a2a;
        }

        .chart-section {
          margin-bottom: 2rem;
        }

        .chart-container {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .chart-legend {
          display: flex;
          gap: 2rem;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #4a5568;
          font-weight: 500;
        }

        .chart-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          text-align: center;
          color: #a0aec0;
        }

        .chart-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .products-section {
          margin-bottom: 2rem;
        }

        .products-table-container {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #a0aec0;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 0.5rem 0;
          color: #4a5568;
        }

        .products-table {
          width: 100%;
        }

        .table-header {
          display: grid;
          grid-template-columns: 3fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 2px solid #e2e8f0;
          font-weight: 600;
          color: #4a5568;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 3fr 1fr 1fr 1fr;
          gap: 1rem;
          padding: 1.5rem 0;
          border-bottom: 1px solid #f1f5f9;
          align-items: center;
          transition: background-color 0.2s ease;
        }

        .table-row:hover {
          background-color: #f8fafc;
        }

        .table-cell {
          font-size: 0.95rem;
          color: #4a5568;
        }

        .product-name {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
        }

        .product-icon {
          font-size: 1.2rem;
        }

        .revenue {
          font-weight: 600;
          color: #2d3748;
        }

        .performance-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .performance-badge.positive {
          background: #c6f6d5;
          color: #22543d;
        }

        .actions-section {
          margin-bottom: 2rem;
        }

        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }

        .action-card {
          background: white;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }

        .action-card:hover {
          border-color: #4299e1;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .action-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .action-content h4 {
          margin: 0 0 0.25rem 0;
          color: #2d3748;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .action-content p {
          margin: 0;
          color: #718096;
          font-size: 0.9rem;
        }

        .alert {
          padding: 1rem 1.5rem;
          border-radius: 8px;
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .alert-success {
          background: #c6f6d5;
          color: #22543d;
          border: 1px solid #9ae6b4;
        }

        .alert-error {
          background: #fed7d7;
          color: #742a2a;
          border: 1px solid #feb2b2;
        }

        @media (max-width: 768px) {
          .seller-analytics {
            padding: 1rem;
          }

          .analytics-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .header-content h1 {
            font-size: 2rem;
          }

          .kpi-grid {
            grid-template-columns: 1fr;
          }

          .actions-grid {
            grid-template-columns: 1fr;
          }

          .table-header,
          .table-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .table-row {
            padding: 1rem;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default SellerAnalytics;
