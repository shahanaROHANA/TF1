// controllers/productController.js
import Product from '../models/productModel.js';

// export const list = async (req, res) => {
//   try {
//     const { station } = req.query;
//     const filter = { available: true };
//     if (station) filter.station = station;
//     const products = await Product.find(filter).sort({ name: 1 });
//     res.json(products);
//   } catch (err) {
//     console.error('Product list error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const get = async (req, res) => {
//   try {
//     const p = await Product.findById(req.params.id);
//     if (!p) return res.status(404).json({ message: 'Not found' });
//     res.json(p);
//   } catch (err) {
//     console.error('Product get error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const create = async (req, res) => {
//   try {
//     const { name, description, priceCents, available, station } = req.body;
//     if (!name || !priceCents) return res.status(400).json({ message: 'Missing fields' });
//     const p = await Product.create({ name, description, priceCents, available, station });
//     res.status(201).json(p);
//   } catch (err) {
//     console.error('Product create error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const update = async (req, res) => {
//   try {
//     const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     res.json(updated);
//   } catch (err) {
//     console.error('Product update error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const remove = async (req, res) => {
//   try {
//     await Product.findByIdAndDelete(req.params.id);
//     res.json({ message: 'Product deleted' });
//   } catch (err) {
//     console.error('Product delete error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };
// export const listProducts = async (req, res) => {
//   try {
//     const { station, q, page = 1, limit = 20, restaurantId, onlyAvailable } = req.query;
//     const filters = {};

//     if (station) filters.station = station;
//     if (restaurantId) filters.restaurant = restaurantId;
//     if (onlyAvailable === 'true') filters.available = true;
//     if (q) filters.name = { $regex: q, $options: 'i' };

//     const skip = (Math.max(1, Number(page)) - 1) * Number(limit);
//     const [items, total] = await Promise.all([
//       Product.find(filters).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
//       Product.countDocuments(filters)
//     ]);

//     res.json({ items, meta: { total, page: Number(page), limit: Number(limit) } });
//   } catch (err) {
//     console.error('listProducts error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// export const getProduct = async (req, res) => {
//   try {
//     const p = await Product.findById(req.params.id);
//     if (!p) return res.status(404).json({ message: 'Not found' });
//     res.json(p);
//   } catch (err) {
//     console.error('getProduct error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// // Admin/vendor create product
// export const createProduct = async (req, res) => {
//   try {
//     const { name, description, priceCents, available = true, station, restaurant, imageUrl, stock } = req.body;
//     const doc = await Product.create({
//       name, description, priceCents: Number(priceCents), available, station, restaurant, imageUrl, stock, createdBy: req.user && req.user._id
//     });
//     res.status(201).json(doc);
//   } catch (err) {
//     console.error('createProduct error', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };

const pick = (obj, keys) => {
  const out = {};
  keys.forEach(k => {
    if (Object.prototype.hasOwnProperty.call(obj, k)) out[k] = obj[k];
  });
  return out;
};

// GET /api/products
export const list = async (req, res) => {
  try {
    const { station, q, page = 1, limit = 50, onlyAvailable } = req.query;
    const filters = {};

    if (station) filters.station = station;
    if (onlyAvailable === 'true') filters.available = true;
    if (q) filters.name = { $regex: q, $options: 'i' };

    const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Product.find(filters).sort({ name: 1 }).skip(skip).limit(Number(limit)),
      Product.countDocuments(filters)
    ]);

    res.json({ items, meta: { total, page: Number(page), limit: Number(limit) } });
  } catch (err) {
    console.error('Product list error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/products/:id
export const get = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    console.error('Product get error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/products  (protected: vendor/admin)
export const create = async (req, res) => {
  try {
    const allowed = ['name', 'description', 'priceCents', 'available', 'station', 'restaurant', 'imageUrl', 'stock'];
    const data = pick(req.body, allowed);

    // Basic validation
    if (!data.name || data.name.trim() === '') return res.status(400).json({ message: 'Name is required' });

    const price = Number(data.priceCents);
    if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ message: 'Invalid priceCents' });
    data.priceCents = Math.round(price);

    // attach creator if available
    if (req.user && req.user._id) data.createdBy = req.user._id;

    const p = await Product.create(data);
    res.status(201).json(p);
  } catch (err) {
    console.error('Product create error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/products/:id  (protected: vendor/admin)
export const update = async (req, res) => {
  try {
    const allowed = ['name', 'description', 'priceCents', 'available', 'station', 'restaurant', 'imageUrl', 'stock'];
    const data = pick(req.body, allowed);

    if (data.priceCents !== undefined) {
      const price = Number(data.priceCents);
      if (!Number.isFinite(price) || price <= 0) return res.status(400).json({ message: 'Invalid priceCents' });
      data.priceCents = Math.round(price);
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    console.error('Product update error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/products/:id  (protected: vendor/admin)
export const remove = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Product delete error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
