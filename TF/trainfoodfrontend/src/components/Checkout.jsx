import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import './Checkout.css';

const Checkout = ({ cartItems, onOrderSuccess, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Processing
  const [orderData, setOrderData] = useState({
    items: cartItems || [],
    deliveryInfo: {
      type: 'train',
      contactName: '',
      contactPhone: '',
      trainNo: '',
      trainName: '',
      coach: '',
      seat: '',
      departureTime: '',
      stationName: '',
      platform: '',
      address: '',
      landmark: '',
      specialInstructions: ''
    },
    paymentMethod: 'UPI',
    couponCode: '',
    specialInstructions: ''
  });
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    delivery: 20,
    discount: 0,
    final: 0
  });

  const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    calculateTotals();
  }, [orderData.items, orderData.couponCode, orderData.deliveryInfo.type]);

  const calculateTotals = () => {
    let subtotal = 0;
    
    orderData.items.forEach(item => {
      const itemPrice = (item.priceCents / 100) * item.quantity;
      subtotal += itemPrice;
      
      // Add option prices
      if (item.options) {
        item.options.forEach(option => {
          if (option.priceCents) {
            subtotal += (option.priceCents / 100);
          }
        });
      }
    });

    const deliveryFee = orderData.deliveryInfo.type === 'train' ? 30 : 
                       orderData.deliveryInfo.type === 'home' ? 40 : 20;
    
    let discount = 0;
    if (orderData.couponCode === 'FIRST10') {
      discount = Math.min(subtotal * 0.1, 10);
    }

    const tax = (subtotal - discount) * 0.05;
    const final = subtotal - discount + tax + deliveryFee;

    setTotals({
      subtotal,
      tax,
      delivery: deliveryFee,
      discount,
      final
    });
  };

  const handleInputChange = (section, field, value) => {
    setOrderData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleMainInputChange = (field, value) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateDeliveryInfo = () => {
    const { deliveryInfo } = orderData;
    
    if (!deliveryInfo.contactName || !deliveryInfo.contactPhone) {
      setError('Contact name and phone are required');
      return false;
    }

    if (deliveryInfo.type === 'train') {
      if (!deliveryInfo.trainNo || !deliveryInfo.coach || !deliveryInfo.seat) {
        setError('Train number, coach, and seat are required for train delivery');
        return false;
      }
    } else if (deliveryInfo.type === 'station') {
      if (!deliveryInfo.stationName) {
        setError('Station name is required for station pickup');
        return false;
      }
    } else if (deliveryInfo.type === 'home') {
      if (!deliveryInfo.address) {
        setError('Address is required for home delivery');
        return false;
      }
    }

    return true;
  };

  const handleProceedToPayment = () => {
    if (!validateDeliveryInfo()) return;
    setStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const idempotencyKey = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Prepare items for API
      const orderItems = orderData.items.map(item => ({
        productId: item.product._id,
        qty: item.quantity,
        itemNote: item.itemNote || '',
        options: item.options || []
      }));

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/orders`,
        {
          items: orderItems,
          deliveryInfo: orderData.deliveryInfo,
          paymentMethod: orderData.paymentMethod,
          couponCode: orderData.couponCode || undefined,
          specialInstructions: orderData.specialInstructions || undefined,
          idempotencyKey
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (orderData.paymentMethod === 'COD') {
        // COD order confirmed immediately
        setStep(3);
        onOrderSuccess && onOrderSuccess(response.data);
      } else {
        // Process online payment
        const { clientSecret, orderId, orderNumber } = response.data;
        
        const stripe = await stripePromise;
        const { error: paymentError } = await stripe.confirmCardPayment(clientSecret);

        if (paymentError) {
          setError(paymentError.message);
        } else {
          setStep(3);
          onOrderSuccess && onOrderSuccess({ ...response.data, paid: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  if (step === 3) {
    return (
      <div className="checkout-success">
        <div className="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order has been {orderData.paymentMethod === 'COD' ? 'confirmed' : 'paid and confirmed'}.</p>
        <p>You will receive a confirmation shortly.</p>
        <button onClick={() => window.location.href = '/orders'} className="view-orders-btn">
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        <h1>Checkout</h1>
        <div className="checkout-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Delivery</div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Payment</div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Confirm</div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="checkout-content">
        <div className="checkout-main">
          {step === 1 && (
            <div className="delivery-section">
              <h2>Delivery Information</h2>
              
              <div className="delivery-type">
                <label>Delivery Type:</label>
                <select 
                  value={orderData.deliveryInfo.type}
                  onChange={(e) => handleInputChange('deliveryInfo', 'type', e.target.value)}
                >
                  <option value="train">Train Delivery</option>
                  <option value="station">Station Pickup</option>
                  <option value="home">Home Delivery</option>
                </select>
              </div>

              <div className="contact-info">
                <h3>Contact Information</h3>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={orderData.deliveryInfo.contactName}
                  onChange={(e) => handleInputChange('deliveryInfo', 'contactName', e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={orderData.deliveryInfo.contactPhone}
                  onChange={(e) => handleInputChange('deliveryInfo', 'contactPhone', e.target.value)}
                />
              </div>

              {orderData.deliveryInfo.type === 'train' && (
                <div className="train-details">
                  <h3>Train Details</h3>
                  <input
                    type="text"
                    placeholder="Train Number"
                    value={orderData.deliveryInfo.trainNo}
                    onChange={(e) => handleInputChange('deliveryInfo', 'trainNo', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Train Name (optional)"
                    value={orderData.deliveryInfo.trainName}
                    onChange={(e) => handleInputChange('deliveryInfo', 'trainName', e.target.value)}
                  />
                  <div className="train-seat">
                    <input
                      type="text"
                      placeholder="Coach"
                      value={orderData.deliveryInfo.coach}
                      onChange={(e) => handleInputChange('deliveryInfo', 'coach', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Seat/Berth"
                      value={orderData.deliveryInfo.seat}
                      onChange={(e) => handleInputChange('deliveryInfo', 'seat', e.target.value)}
                    />
                  </div>
                  <input
                    type="datetime-local"
                    placeholder="Departure Time"
                    value={orderData.deliveryInfo.departureTime}
                    onChange={(e) => handleInputChange('deliveryInfo', 'departureTime', e.target.value)}
                  />
                </div>
              )}

              {orderData.deliveryInfo.type === 'station' && (
                <div className="station-details">
                  <h3>Station Pickup Details</h3>
                  <input
                    type="text"
                    placeholder="Station Name"
                    value={orderData.deliveryInfo.stationName}
                    onChange={(e) => handleInputChange('deliveryInfo', 'stationName', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Platform (optional)"
                    value={orderData.deliveryInfo.platform}
                    onChange={(e) => handleInputChange('deliveryInfo', 'platform', e.target.value)}
                  />
                </div>
              )}

              {orderData.deliveryInfo.type === 'home' && (
                <div className="home-details">
                  <h3>Delivery Address</h3>
                  <textarea
                    placeholder="Full Address"
                    value={orderData.deliveryInfo.address}
                    onChange={(e) => handleInputChange('deliveryInfo', 'address', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Landmark (optional)"
                    value={orderData.deliveryInfo.landmark}
                    onChange={(e) => handleInputChange('deliveryInfo', 'landmark', e.target.value)}
                  />
                </div>
              )}

              <div className="special-instructions">
                <h3>Special Instructions</h3>
                <textarea
                  placeholder="Any special requests (e.g., no onion, extra spoon, etc.)"
                  value={orderData.deliveryInfo.specialInstructions}
                  onChange={(e) => handleInputChange('deliveryInfo', 'specialInstructions', e.target.value)}
                />
              </div>

              <button onClick={handleProceedToPayment} className="proceed-btn">
                Proceed to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="payment-section">
              <h2>Payment Method</h2>
              
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="UPI"
                    checked={orderData.paymentMethod === 'UPI'}
                    onChange={(e) => handleMainInputChange('paymentMethod', e.target.value)}
                  />
                  <span className="payment-icon">📱</span>
                  <span>UPI</span>
                </label>
                
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="CARD"
                    checked={orderData.paymentMethod === 'CARD'}
                    onChange={(e) => handleMainInputChange('paymentMethod', e.target.value)}
                  />
                  <span className="payment-icon">💳</span>
                  <span>Credit/Debit Card</span>
                </label>
                
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="WALLET"
                    checked={orderData.paymentMethod === 'WALLET'}
                    onChange={(e) => handleMainInputChange('paymentMethod', e.target.value)}
                  />
                  <span className="payment-icon">👛</span>
                  <span>Wallet</span>
                </label>
                
                <label className="payment-option">
                  <input
                    type="radio"
                    name="payment"
                    value="COD"
                    checked={orderData.paymentMethod === 'COD'}
                    onChange={(e) => handleMainInputChange('paymentMethod', e.target.value)}
                  />
                  <span className="payment-icon">💰</span>
                  <span>Cash on Delivery</span>
                </label>
              </div>

              <div className="coupon-section">
                <h3>Coupon Code</h3>
                <div className="coupon-input">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={orderData.couponCode}
                    onChange={(e) => handleMainInputChange('couponCode', e.target.value)}
                  />
                  {orderData.couponCode === 'FIRST10' && (
                    <span className="coupon-applied">Applied: 10% off</span>
                  )}
                </div>
              </div>

              <div className="order-instructions">
                <h3>Order Instructions</h3>
                <textarea
                  placeholder="Any additional instructions for your order"
                  value={orderData.specialInstructions}
                  onChange={(e) => handleMainInputChange('specialInstructions', e.target.value)}
                />
              </div>

              <button 
                onClick={handlePayment} 
                className="pay-btn"
                disabled={loading}
              >
                {loading ? 'Processing...' : `Pay ₹${formatPrice(totals.final)}`}
              </button>
            </div>
          )}
        </div>

        <div className="checkout-sidebar">
          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {orderData.items.map((item, index) => (
                <div key={index} className="summary-item">
                  <div className="item-info">
                    <h4>{item.product.name}</h4>
                    <p>Qty: {item.quantity}</p>
                    {item.itemNote && <p className="item-note">Note: {item.itemNote}</p>}
                  </div>
                  <div className="item-price">
                    ₹{formatPrice((item.priceCents / 100) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="total-row discount">
                  <span>Discount:</span>
                  <span>-₹{formatPrice(totals.discount)}</span>
                </div>
              )}
              <div className="total-row">
                <span>Tax (5%):</span>
                <span>₹{formatPrice(totals.tax)}</span>
              </div>
              <div className="total-row">
                <span>Delivery:</span>
                <span>₹{formatPrice(totals.delivery)}</span>
              </div>
              <div className="total-row final">
                <span>Total:</span>
                <span>₹{formatPrice(totals.final)}</span>
              </div>
            </div>

            {step === 1 && (
              <div className="delivery-estimate">
                <h3>Estimated Delivery</h3>
                <p>25-35 minutes after confirmation</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
