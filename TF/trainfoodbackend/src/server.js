// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import passport from 'passport';
import { createServer } from 'http';
import connectDB from './config/db.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import socketService from './services/socketService.js';

// ESM route imports (default exports)
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import chatRoutes from "./routes/chatRoutes.js";
import botRoutes from "./routes/botRoutes.js";
import restaurantRoutes from './routes/restaurantRoutes.js';

import cartRoutes from './routes/cartRoutes.js';
import sellerRoutes from "./routes/sellerRoutes.js";
import sellerDashboardRoutes from './routes/sellerDashboardRoutes.js';

import adminRoutes from './routes/adminRoutes.js';
import deliveryRoutes from "./routes/deliveryRoutes.js";










const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 4003;

// Connect DB
connectDB();

// Initialize Socket.IO
socketService.initialize(server);

// Initialize Passport
app.use(passport.initialize());

// Normal JSON + CORS middleware (webhook route uses raw body inside its router)
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:4002', process.env.DOMAIN || true], credentials: true }));
app.use(express.json());

// API routes (auth routes have their own rate limiting)
app.use('/api/auth', authRoutes);

// Apply general rate limiting to other API routes
app.use('/api', generalLimiter);
app.use('/api/products', productRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/orders', orderRoutes);



// Health
app.get('/', (req, res) => res.send('🚆 TrainFood Backend is running (ESM)'));

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Server error' });
});

app.use("/api/chat", chatRoutes);
app.use("/api/bot", botRoutes);
app.use('/api/payment', paymentRoutes);

// mount webhook route exactly where the controller expects: if you used '/webhook' earlier, also add:
app.use('/webhook', paymentRoutes); // or duplicate the webhook route separately:
// app.post('/webhook', stripeWebhookHandler); // if you prefer direct mount

app.use('/api/cart', cartRoutes);

app.use("/api/sellers", sellerRoutes);


app.use('/api/seller/dashboard', sellerDashboardRoutes);

app.use('/api/admin', adminRoutes);

app.use("/api/delivery", deliveryRoutes);

// Socket.IO connection stats endpoint
app.get('/api/socket/stats', (req, res) => {
  res.json(socketService.getConnectedUsersCount());
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});




// Google Maps API integration
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY || '';

if (!GOOGLE_API_KEY) {
  console.warn('Warning: GOOGLE_MAPS_API_KEY not set. Places endpoints will fail until you set it.');
}

/**
 * Safe fetch GET wrapper to ensure proper URL format and give helpful logs
 */
async function safeGet(url, opts = {}) {
  // Ensure url starts with https://
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    throw new Error(`Invalid URL passed to safeGet: ${url}`);
  }
  const response = await fetch(url, opts);
  return await response.json();
}

/**
 * Build Places Nearby Search URL
 */
function buildNearbyUrl({ location, radius = 1000, type, keyword, pagetoken }) {
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    location: `${location.lat},${location.lng}`,
    radius: String(radius),
  });
  if (type) params.append('type', type);
  if (keyword) params.append('keyword', keyword);
  if (pagetoken) params.append('pagetoken', pagetoken);
  return `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params.toString()}`;
}

/**
 * Helper: call Places Nearby Search
 */
async function placesNearby({ location, radius = 1000, type, keyword, pagetoken }) {
  if (!GOOGLE_API_KEY) {
    throw new Error('GOOGLE_MAPS_API_KEY not configured on server');
  }
  const url = buildNearbyUrl({ location, radius, type, keyword, pagetoken });
  const data = await safeGet(url, { timeout: 10000 });
  return data;
}

/**
 * Fetch Place Details by place_id
 */
async function placeDetails(place_id, fields = ['formatted_phone_number','website','opening_hours','url']) {
  if (!GOOGLE_API_KEY) throw new Error('GOOGLE_MAPS_API_KEY not configured');
  const params = new URLSearchParams({
    key: GOOGLE_API_KEY,
    place_id,
    fields: fields.join(',')
  });
  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`;
  const data = await safeGet(url, { timeout: 10000 });
  return data;
}

/**
 * GET /api/stations-with-restaurants
 * Query params:
 *   lat (required), lng (required)
 *   stationRadius (meters) default 2000
 *   stationLimit (max stations to fetch) default 5
 *   restaurantRadius (meters) default 300
 *   details (true|false) default false -> whether to call Place Details for each restaurant
 */
app.get('/api/stations-with-restaurants', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'lat & lng required (as query params)' });
    }

    const stationRadius = Number(req.query.stationRadius || 2000);
    const stationLimit = Number(req.query.stationLimit || 5);
    const restaurantRadius = Number(req.query.restaurantRadius || 300);
    const details = String(req.query.details || 'false').toLowerCase() === 'true';

    // 1) Find train stations near the location
    let stationResp = await placesNearby({
      location: { lat, lng },
      radius: stationRadius,
      type: 'train_station',
    });

    // fallback: if no results, try transit_station
    if ((!stationResp.results || stationResp.results.length === 0)) {
      console.log('No train_station found, trying transit_station fallback');
      stationResp = await placesNearby({
        location: { lat, lng },
        radius: stationRadius,
        type: 'transit_station',
      });
    }

    const stations = stationResp.results || [];
    const topStations = stations.slice(0, stationLimit);

    // 2) For each station, search for restaurants near station location
    const stationPromises = topStations.map(async (st) => {
      const stLocation = {
        lat: st.geometry.location.lat,
        lng: st.geometry.location.lng,
      };

      const restaurantsResp = await placesNearby({
        location: stLocation,
        radius: restaurantRadius,
        type: 'restaurant',
      });

      const restaurants = (restaurantsResp.results || []).slice(0, 20); // limit to 20 by page

      // Optionally enrich restaurants with Place Details (only if details=true)
      const mappedRestaurants = await Promise.all(restaurants.map(async (r) => {
        const base = {
          place_id: r.place_id,
          name: r.name,
          location: r.geometry.location,
          rating: r.rating,
          user_ratings_total: r.user_ratings_total,
          vicinity: r.vicinity,
          opening_hours: r.opening_hours || null,
        };
        if (details) {
          try {
            const det = await placeDetails(r.place_id, ['formatted_phone_number','website','opening_hours','formatted_address']);
            if (det && det.result) {
              base.details = {
                formatted_phone_number: det.result.formatted_phone_number,
                website: det.result.website,
                formatted_address: det.result.formatted_address,
                opening_hours: det.result.opening_hours || null
              };
            }
          } catch (err) {
            console.warn('Place details fetch failed for', r.place_id, err?.message || err);
          }
        }
        return base;
      }));

      return {
        station: {
          place_id: st.place_id,
          name: st.name,
          location: st.geometry.location,
          vicinity: st.vicinity,
        },
        restaurants: mappedRestaurants,
      };
    });

    const stationsWithRestaurants = await Promise.all(stationPromises);

    const payload = {
      origin: { lat, lng },
      stationRadius,
      restaurantRadius,
      stations: stationsWithRestaurants,
    };

    return res.json(payload);
  } catch (err) {
    console.error('Error /api/stations-with-restaurants:', err?.response?.data || err.message || err);
    const details = err?.response?.data || err?.message || String(err);
    return res.status(500).json({ error: 'Server error', details });
  }
});

/**
 * Simple geocode route (address => lat/lng)
 * GET /api/geocode?address=Colombo Fort Railway Station
 */
app.get('/api/geocode', async (req, res) => {
  try {
    const address = String(req.query.address || '').trim();
    if (!address) return res.status(400).json({ error: 'address query param required' });
    if (!GOOGLE_API_KEY) return res.status(500).json({ error: 'Server not configured with GOOGLE_MAPS_API_KEY' });

    const params = new URLSearchParams({
      address,
      key: GOOGLE_API_KEY
    });
    const url = `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`;
    const data = await safeGet(url, { timeout: 10000 });
    return res.json(data);
  } catch (err) {
    console.error('Error /api/geocode', err?.response?.data || err.message || err);
    return res.status(500).json({ error: 'Server error', details: err?.response?.data || err.message || err });
  }
});
