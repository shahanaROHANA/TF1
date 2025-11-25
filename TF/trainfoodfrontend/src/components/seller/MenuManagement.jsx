import React, { useState, useEffect } from 'react';

const MenuManagement = ({ mode }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(mode === 'add');
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({
    category: 'all',
    available: 'all'
  });
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Veg',
    imageUrl: '',
    stock: '',
    deliveryTimeEstimate: '25 mins'
  });

  useEffect(() => {
    if (mode === 'list') {
      fetchProducts();
    }
  }, [filters, mode]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('sellerToken') || localStorage.getItem('token');
      const queryParams = new URLSearchParams();
      
      if (filters.category !== 'all') queryParams.append('category', filters.category);
      if (filters.available !== 'all') queryParams.append('available', filters.available);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/seller/dashboard/products?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setMessage('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      setMessage('Product name is required');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setMessage('Valid price is required');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('sellerToken') || localStorage.getItem('token');
      if (!token) {
        setMessage('Authentication required. Please login again.');
        return;
      }

      const url = editingProduct
        ? `${import.meta.env.VITE_API_URL}/seller/dashboard/products/${editingProduct._id}`
        : `${import.meta.env.VITE_API_URL}/seller/dashboard/products`;

      const method = editingProduct ? 'PUT' : 'POST';

      // Convert price to cents
      const submitData = {
        ...formData,
        priceCents: Math.round(parseFloat(formData.price) * 100)
      };
      delete submitData.price;

      console.log('Submitting product data:', submitData); // Debug log

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      console.log('Response status:', response.status); // Debug log

      if (response.ok) {
        const result = await response.json();
        console.log('Success response:', result); // Debug log

        const successMessage = editingProduct ? 'Product updated successfully!' : 'Product added successfully!';
        setMessage(successMessage);

        if (editingProduct) {
          // For editing, close the form and refresh list
          resetForm();
          if (mode === 'list') {
            fetchProducts();
          }
        } else {
          // For adding, just reset the form but keep it open for adding more
          setFormData({
            name: '',
            description: '',
            price: '',
            category: 'Veg',
            imageUrl: '',
            stock: '',
            deliveryTimeEstimate: '30 mins'
          });
          setEditingProduct(null);
          // Don't close the form - let user add more products
          if (mode === 'list') {
            fetchProducts();
          }

          // Auto-clear success message after 3 seconds
          setTimeout(() => {
            setMessage('');
          }, 3000);
        }
      } else {
        const error = await response.json().catch(() => ({ message: 'Unknown error' }));
        console.error('Error response:', error); // Debug log
        setMessage(error.message || 'Failed to save product');
      }
    } catch (error) {
      console.error('Submit error:', error); // Debug log
      setMessage('Error saving product. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: (product.priceCents / 100).toFixed(2),
      category: product.category,
      imageUrl: product.imageUrl || '',
      stock: product.stock || '',
      deliveryTimeEstimate: product.deliveryTimeEstimate || '30 mins'
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('sellerToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seller/dashboard/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Product deleted successfully!');
        fetchProducts();
      } else {
        const error = await response.json();
        setMessage(error.message || 'Failed to delete product');
      }
    } catch (error) {
      setMessage('Error deleting product. Please try again.');
    }
  };

  const toggleAvailability = async (product) => {
    try {
      const token = localStorage.getItem('sellerToken') || localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/seller/dashboard/products/${product._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ available: !product.available })
      });

      if (response.ok) {
        setMessage(`Product ${product.available ? 'deactivated' : 'activated'} successfully!`);
        fetchProducts();
      }
    } catch (error) {
      setMessage('Error updating product availability.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Veg',
      imageUrl: '',
      stock: '',
      deliveryTimeEstimate: '30 mins'
    });
    setEditingProduct(null);
    // Only close the form if we're in list mode, keep it open in add mode
    if (mode === 'list') {
      setShowAddForm(false);
    }
  };

  const formatPrice = (cents) => {
    return `₹${(cents / 100).toFixed(2)}`;
  };

  if (loading && mode === 'list' && products.length === 0) {
    return (
      <div className="menu-management">
        <div className="card">
          <div className="text-center p-4">
            <div className="loading-spinner"></div>
            <p>Loading menu items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="menu-management">
      <div className="card">
        <div className="card-header">
           <h2 className="card-title">
             {mode === 'add' ? '➕ Add Product' : '📦 My Products'}
           </h2>
           {mode === 'list' && (
             <button
               className="btn btn-primary"
               onClick={() => setShowAddForm(true)}
             >
               ➕ Add New Item
             </button>
           )}
           {mode === 'add' && (
             <div className="header-info">
               <small className="text-muted">💡 Add multiple products quickly - form stays open after each addition</small>
             </div>
           )}
         </div>

        {message && (
          <div className={`alert ${message.includes('success') ? 'alert-success' : 'alert-danger'}`}>
            {message}
          </div>
        )}

        {mode === 'list' && (
          <>
            {/* Filters */}
            <div className="filters-section">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    className="form-control"
                    value={filters.category}
                    onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="all">All Categories</option>
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Availability</label>
                  <select
                    className="form-control"
                    value={filters.available}
                    onChange={(e) => setFilters(prev => ({ ...prev, available: e.target.value }))}
                  >
                    <option value="all">All Items</option>
                    <option value="true">Available</option>
                    <option value="false">Out of Stock</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products List */}
            <div className="products-list">
              {products.length === 0 ? (
                <div className="text-center p-4">
                  <p>No products found. Add your first menu item!</p>
                </div>
              ) : (
                <div className="products-grid">
                  {products.map(product => (
                    <div key={product._id} className="product-card">
                      <div className="product-image">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} />
                        ) : (
                          <div className="image-placeholder">🍱</div>
                        )}
                        <div className="product-status">
                          <span className={`status-badge ${product.available ? 'active' : 'inactive'}`}>
                            {product.available ? '✅ Available' : '❌ Out of Stock'}
                          </span>
                        </div>
                      </div>

                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-meta">
                          <span className="price">{formatPrice(product.priceCents)}</span>
                          <span className="category">{product.category}</span>
                        </div>
                        {product.restaurantName && (
                          <p className="restaurant-name">🏪 {product.restaurantName}</p>
                        )}
                        {product.deliveryTimeEstimate && (
                          <p className="delivery-time">⏱️ {product.deliveryTimeEstimate}</p>
                        )}
                        {product.stock !== null && (
                          <p className="stock-info">📦 Stock: {product.stock || 'Unlimited'}</p>
                        )}
                      </div>

                      <div className="product-actions">
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => handleEdit(product)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className={`btn btn-sm ${product.available ? 'btn-warning' : 'btn-success'}`}
                          onClick={() => toggleAvailability(product)}
                        >
                          {product.available ? '⏸️ Deactivate' : '▶️ Activate'}
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(product._id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Product Modal */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <h3>{editingProduct ? '✏️ Edit Product' : '➕ Add New Product'}</h3>
                {editingProduct?.restaurantName && (
                  <p className="restaurant-info">🏪 Restaurant: {editingProduct.restaurantName}</p>
                )}
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  if (mode === 'add') {
                    // In add mode, just clear the form and show message
                    resetForm();
                    setMessage('Form cleared. Ready to add another product!');
                    setTimeout(() => setMessage(''), 3000);
                  } else {
                    // In list mode, close the modal
                    resetForm();
                  }
                }}
                disabled={loading}
              >
                {mode === 'add' ? '🗑️ Clear Form' : '❌ Close'}
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-control"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="form-control"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="form-control"
                  rows="3"
                  placeholder="Describe your product..."
                ></textarea>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="form-control"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                    <option value="Jain">Jain</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Delivery Time</label>
                  <input
                    type="text"
                    name="deliveryTimeEstimate"
                    value={formData.deliveryTimeEstimate}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="30 mins"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="Leave empty for unlimited"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    className="form-control"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="submit"
                  className={`btn btn-primary ${loading ? 'btn-loading' : ''}`}
                  disabled={loading || !formData.name.trim() || !formData.price}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner small"></span>
                      {editingProduct ? '💾 Updating...' : '➕ Adding...'}
                    </>
                  ) : (
                    editingProduct ? '💾 Update Product' : '➕ Add Product'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    if (mode === 'add') {
                      resetForm();
                      setMessage('✅ Form cleared. Ready to add another product!');
                      setTimeout(() => setMessage(''), 3000);
                    } else {
                      resetForm();
                    }
                  }}
                  disabled={loading}
                >
                  {mode === 'add' ? '🗑️ Clear Form' : '❌ Cancel'}
                </button>
              </div>

              {/* Form validation hints */}
              <div className="form-hints">
                {!formData.name.trim() && <small className="hint warning">⚠️ Product name is required</small>}
                {(!formData.price || parseFloat(formData.price) <= 0) && <small className="hint warning">⚠️ Valid price is required</small>}
                {formData.name.trim() && formData.price && parseFloat(formData.price) > 0 && (
                  <small className="hint success">✅ Ready to submit</small>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

<style jsx>{`
  .form-hints {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #f8fafc;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
  }

  .hint {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.85rem;
  }

  .hint.warning {
    color: #dd6b20;
  }

  .hint.success {
    color: #38a169;
  }

  .btn-loading {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .loading-spinner.small {
    width: 16px;
    height: 16px;
    border: 2px solid #ffffff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .menu-management {
      padding: 1rem;
    }

    .products-grid {
      grid-template-columns: 1fr;
    }

    .product-card {
      margin-bottom: 1rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .form-actions .btn {
      width: 100%;
      margin-bottom: 0.5rem;
    }
  }
`}</style>

export default MenuManagement;
