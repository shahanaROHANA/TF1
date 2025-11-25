import Seller from "../models/Seller.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// Register Seller
export const registerSeller = async (req, res) => {
  try {
    const { name, email, password, restaurantName, station } = req.body;
    const exists = await Seller.findOne({ email });
    if (exists) return res.status(400).json({ message: "Seller already exists" });

    const seller = await Seller.create({ name, email, password, restaurantName, station });
    res.status(201).json({
      _id: seller._id,
      name: seller.name,
      restaurantName: seller.restaurantName,
      token: generateToken(seller._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Login Seller
export const loginSeller = async (req, res) => {
  const { email, password } = req.body;
  const seller = await Seller.findOne({ email }).select('-password').populate('restaurant');
  if (seller && (await seller.matchPassword(password))) {
    res.json({
      seller: seller,
      token: generateToken(seller._id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials" });
  }
};
