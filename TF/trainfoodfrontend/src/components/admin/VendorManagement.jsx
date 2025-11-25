import { useState, useEffect } from 'react';
import { FaStore, FaCheck, FaTimes, FaEdit, FaTrash, FaEye, FaChartLine } from 'react-icons/fa';

const VendorManagement = () => {
  const [vendors, setVendors] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showPerformance, setShowPerformance] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [activeTab, setActiveTab] = useState('approved');

  useEffect(() => {
    fetchVendors();
    fetchPendingVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setVendors(data);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/sellers/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setPendingVendors(data);
    } catch (error) {
      console.error('Error fetching pending vendors:', error);
    }
  };

  const approveVendor = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/sellers/${vendorId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchVendors();
      fetchPendingVendors();
    } catch (error) {
      console.error('Error approving vendor:', error);
    }
  };

  const rejectVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to reject this vendor? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/admin/sellers/${vendorId}/reject`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchPendingVendors();
      } catch (error) {
        console.error('Error rejecting vendor:', error);
      }
    }
  };

  const deleteVendor = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`/api/admin/vendors/${vendorId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        fetchVendors();
      } catch (error) {
        console.error('Error deleting vendor:', error);
      }
    }
  };

  const viewVendorPerformance = async (vendorId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/vendors/${vendorId}/performance`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setSelectedVendor(data);
      setShowPerformance(true);
    } catch (error) {
      console.error('Error fetching vendor performance:', error);
    }
  };

  const updateVendor = async (vendorId, updates) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/vendors/${vendorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      fetchVendors();
      setEditingVendor(null);
    } catch (error) {
      console.error('Error updating vendor:', error);
    }
  };

  if (loading) {
    return <div className="loading-spinner">Loading vendors...</div>;
  }

  return (
    <div className="vendor-management">
      {/* Header */}
      <div className="admin-card">
        <h2>🏪 Vendor Management</h2>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            className={`btn ${activeTab === 'approved' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Approved Vendors ({vendors.length})
          </button>
          <button
            className={`btn ${activeTab === 'pending' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pending Approval ({pendingVendors.length})
          </button>
        </div>
      </div>

      {activeTab === 'approved' && (
        <div className="admin-card">
          <h3>✅ Approved Vendors</h3>
          {vendors.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Business Name</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor._id}>
                      <td>{vendor.name}</td>
                      <td>{vendor.email}</td>
                      <td>{vendor.phone || 'N/A'}</td>
                      <td>{vendor.businessName || 'N/A'}</td>
                      <td>
                        <span className="status-badge status-active">
                          {vendor.isApproved ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-primary"
                            onClick={() => viewVendorPerformance(vendor._id)}
                            title="View Performance"
                          >
                            <FaChartLine />
                          </button>
                          <button
                            className="btn btn-warning"
                            onClick={() => setEditingVendor(vendor)}
                            title="Edit Vendor"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => deleteVendor(vendor._id)}
                            title="Delete Vendor"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No approved vendors</h3>
              <p>Vendors who have been approved will appear here.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="admin-card">
          <h3>⏳ Pending Approval</h3>
          {pendingVendors.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Business Name</th>
                    <th>Registration Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingVendors.map((vendor) => (
                    <tr key={vendor._id}>
                      <td>{vendor.name}</td>
                      <td>{vendor.email}</td>
                      <td>{vendor.phone || 'N/A'}</td>
                      <td>{vendor.businessName || 'N/A'}</td>
                      <td>{new Date(vendor.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            className="btn btn-success"
                            onClick={() => approveVendor(vendor._id)}
                            title="Approve Vendor"
                          >
                            <FaCheck />
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => rejectVendor(vendor._id)}
                            title="Reject Vendor"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <h3>No pending vendors</h3>
              <p>New vendor applications will appear here for approval.</p>
            </div>
          )}
        </div>
      )}

      {/* Performance Modal */}
      {showPerformance && selectedVendor && (
        <div className="modal-overlay" onClick={() => setShowPerformance(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Vendor Performance</h2>
              <button className="close-modal" onClick={() => setShowPerformance(false)}>
                ×
              </button>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(2, 1fr)', 
                gap: '1rem' 
              }}>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0', color: '#636e72' }}>Total Orders</h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {selectedVendor.totalOrders}
                  </p>
                </div>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0', color: '#636e72' }}>Completed Orders</h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {selectedVendor.completedOrders}
                  </p>
                </div>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0', color: '#636e72' }}>Total Revenue</h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    ₹{(selectedVendor.totalRevenue / 100).toFixed(2)}
                  </p>
                </div>
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <h4 style={{ margin: '0', color: '#636e72' }}>Completion Rate</h4>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {selectedVendor.completionRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Vendor Modal */}
      {editingVendor && (
        <div className="modal-overlay" onClick={() => setEditingVendor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Vendor</h2>
              <button className="close-modal" onClick={() => setEditingVendor(null)}>
                ×
              </button>
            </div>
            <form 
              className="admin-form"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const updates = {
                  name: formData.get('name'),
                  email: formData.get('email'),
                  phone: formData.get('phone'),
                  businessName: formData.get('businessName')
                };
                updateVendor(editingVendor._id, updates);
              }}
            >
              <div className="form-group">
                <label>Name</label>
                <input 
                  type="text" 
                  name="name" 
                  defaultValue={editingVendor.name}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  defaultValue={editingVendor.email}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  name="phone" 
                  defaultValue={editingVendor.phone}
                />
              </div>
              <div className="form-group">
                <label>Business Name</label>
                <input 
                  type="text" 
                  name="businessName" 
                  defaultValue={editingVendor.businessName}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setEditingVendor(null)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
