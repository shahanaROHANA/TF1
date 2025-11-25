# TrainFood Backend - Postman Testing Steps

## 🚀 **Setup Steps**

### **1. Start the Backend Server**
```bash
npm start
# Server runs on http://localhost:4001
```

### **2. Postman Collection Setup**
- Create new collection: "TrainFood Backend"
- Set base URL: `http://localhost:4001`

## 🔐 **Authentication Testing**

### **POST /api/auth/register**
**URL**: `http://localhost:4001/api/auth/register`

**Body (JSON)**:
```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "123456"
}
```

**Expected Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "64f8a1b2c3d4e5f6a7b8c9d0",
    "name": "Test User",
    "email": "test@example.com",
    "role": "customer"
  }
}
```

### **POST /api/auth/login**
**URL**: `http://localhost:4001/api/auth/login`

**Body (JSON)**:
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

**Expected Response**: Same as register (token + user info)

### **POST /api/auth/forget-password**
**URL**: `http://localhost:4001/api/auth/forget-password`

**Body (JSON)**:
```json
{
  "email": "test@example.com"
}
```

### **POST /api/auth/reset-password**
**URL**: `http://localhost:4001/api/auth/reset-password`

**Body (JSON)**:
```json
{
  "email": "test@example.com",
  "otp": "123456",
  "newPassword": "newpassword123"
}
```

## 🛒 **Product & Order Testing**

### **GET /api/products** (Get all products)
**URL**: `http://localhost:4001/api/products`
**Method**: GET
**No auth required**

### **POST /api/orders** (Create order)
**URL**: `http://localhost:4001/api/orders`
**Method**: POST
**Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

**Body (JSON)**:
```json
{
  "items": [
    {
      "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
      "qty": 2
    }
  ]
}
```

**Expected Response**:
```json
{
  "orderId": "64f8a1b2c3d4e5f6a7b8c9d1",
  "clientSecret": "pi_64f8a1b2c3d4e5f6a7b8c9d1_secret_xxx",
  "totalCents": 2000
}
```

### **GET /api/orders** (Get user orders)
**URL**: `http://localhost:4001/api/orders`
**Method**: GET
**Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

## 🛍️ **Cart Testing**

### **POST /api/cart/add** (Add to cart)
**URL**: `http://localhost:4001/api/cart/add`
**Method**: POST
**Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

**Body (JSON)**:
```json
{
  "productId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "quantity": 1
}
```

### **GET /api/cart** (Get user cart)
**URL**: `http://localhost:4001/api/cart`
**Method**: GET
**Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

## 💳 **Payment Testing**

### **POST /api/payment/create-payment-intent**
**URL**: `http://localhost:4001/api/payment/create-payment-intent`
**Method**: POST
**Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

**Body (JSON)**:
```json
{
  "orderId": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

## 🤖 **Chat Testing**

### **POST /api/chat/conversation** (Create chat)
**URL**: `http://localhost:4001/api/chat/conversation`
**Method**: POST
**Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

**Body (JSON)**:
```json
{
  "senderId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "receiverId": "64f8a1b2c3d4e5f6a7b8c9d1"
}
```

### **POST /api/chat/message** (Send message)
**URL**: `http://localhost:4001/api/chat/message`
**Method**: POST
**Headers**: `Authorization: Bearer YOUR_JWT_TOKEN`

**Body (JSON)**:
```json
{
  "chatId": "64f8a1b2c3d4e5f6a7b8c9d2",
  "senderId": "64f8a1b2c3d4e5f6a7b8c9d0",
  "text": "Hello, I want to order food"
}
```

## 🏪 **Seller Testing**

### **POST /api/sellers/register**
**URL**: `http://localhost:4001/api/sellers/register`
**Method**: POST

**Body (JSON)**:
```json
{
  "name": "Restaurant Owner",
  "email": "restaurant@example.com",
  "password": "password123",
  "restaurantName": "Test Restaurant",
  "station": "Chennai Central"
}
```

### **POST /api/sellers/login**
**URL**: `http://localhost:4001/api/sellers/login`
**Method**: POST

**Body (JSON)**:
```json
{
  "email": "restaurant@example.com",
  "password": "password123"
}
```

## 🚚 **Delivery Testing**

### **POST /api/delivery/login**
**URL**: `http://localhost:4001/api/delivery/login`
**Method**: POST

**Body (JSON)**:
```json
{
  "email": "delivery@example.com",
  "password": "password123"
}
```

## 🛡️ **Testing Rate Limiting**

### **Test Auth Rate Limit**
1. Send 6 login requests within 15 minutes
2. 6th request should return: `429 Too Many Requests`

### **Test Password Reset Rate Limit**
1. Send 4 password reset requests within 1 hour
2. 4th request should return: `429 Too Many Requests`

## 📝 **Testing Tips**

### **1. Save Tokens**
- Copy JWT token from login/register response
- Use in Authorization header for protected routes

### **2. Test Validation**
- Try invalid emails in registration
- Try short passwords (< 6 chars)
- Try invalid product IDs in orders

### **3. Test Error Scenarios**
- Missing required fields
- Invalid JWT tokens
- Wrong credentials
- Duplicate email registration

### **4. Common Headers**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

### **5. Environment Variables**
Make sure these are set in `.env`:
- `MONGO_URI`
- `JWT_SECRET`
- `STRIPE_SECRET_KEY`
- `SMTP_USER`
- `SMTP_PASS`

## ✅ **Expected Status Codes**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (wrong role)
- `404` - Not Found
- `429` - Too Many Requests (rate limit)
- `500` - Server Error
