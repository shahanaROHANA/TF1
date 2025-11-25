import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Register.css';

const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, registerData);

      // Registration successful, redirect to login page
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div className="register-container">
      <div className="register-illustration">
        <div className="illustration-content">
          <h1>🚀</h1>
          <h3>Join TrainFood Today</h3>
          <p>Create your account and start ordering delicious food from train stations across the country</p>
        </div>
      </div>
      <div className="register-form">
        <div className="form-header">
          <h2>Create Account</h2>
          <p className="form-subtitle">Sign up to get started with TrainFood</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="google-login-section">
          <button type="button" onClick={handleGoogleLogin} className="google-login-btn">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" className="google-icon" />
            Continue with Google
          </button>
          <div className="divider">
            <span>or</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className={`input-wrapper ${formData.name ? 'has-content' : ''}`}>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength="2"
                aria-label="Full name"
              />
              <label htmlFor="name">Full name</label>
            </div>
          </div>

          <div className="form-group">
            <div className={`input-wrapper ${formData.email ? 'has-content' : ''}`}>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                aria-label="Email address"
              />
              <label htmlFor="email">Email address</label>
            </div>
          </div>

          <div className="form-group">
            <div className={`input-wrapper ${formData.password ? 'has-content' : ''}`}>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
                aria-label="Password"
              />
              <label htmlFor="password">Password</label>
            </div>
          </div>

          <div className="form-group">
            <div className={`input-wrapper ${formData.confirmPassword ? 'has-content' : ''}`}>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
                aria-label="Confirm password"
              />
              <label htmlFor="confirmPassword">Confirm password</label>
            </div>
          </div>

          <div className="form-group">
            <div className={`input-wrapper ${formData.role ? 'has-content' : ''}`}>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                aria-label="Account type"
              >
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="deliveryAgent">Delivery Agent</option>
                <option value="admin">Admin</option>
              </select>
              <label htmlFor="role">Account type</label>
            </div>
          </div>

          <button type="submit" disabled={loading} className="register-btn">
            {loading ? (
              <>
                <div className="spinner"></div>
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <div className="login-link">
          <span>Already have an account? </span>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="login-link-btn"
            aria-label="Go to login page"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
