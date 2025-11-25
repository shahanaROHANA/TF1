import mongoose from 'mongoose';
import Restaurant from './src/models/restaurantModel.js';
import Product from './src/models/productModel.js';
import dotenv from 'dotenv';

dotenv.config();

const stationData = {
  'Kilinochchi': [
    {
      name: 'Bharathi Hotel',
      cuisineType: 'Veg',
      description: 'Pure vegetarian restaurant',
      menuItems: [
        { name: 'Veg Kottu', price: 25000, description: 'Mixed vegetable kottu', category: 'Veg' },
        { name: 'Veg Biriyani', price: 28000, description: 'Vegetable biriyani with raita', category: 'Veg' },
        { name: 'Veg Rice', price: 20000, description: 'Steamed vegetables with rice', category: 'Veg' },
        { name: 'Rice & Curry', price: 22000, description: 'Traditional rice with vegetable curry', category: 'Veg' },
        { name: 'Roll', price: 15000, description: 'Vegetable roll', category: 'Veg' },
        { name: 'Samosa', price: 8000, description: 'Crispy vegetable samosa', category: 'Veg' },
        { name: 'Parota', price: 12000, description: 'Flaky parota with curry', category: 'Veg' }
      ]
    },
    {
      name: 'WhiteStone',
      cuisineType: 'Non-Veg',
      description: 'Non-vegetarian specialties',
      menuItems: [
        { name: 'Chicken Kottu', price: 35000, description: 'Spicy chicken kottu', category: 'Non-Veg' },
        { name: 'Mutton Kottu', price: 45000, description: 'Tender mutton kottu', category: 'Non-Veg' },
        { name: 'Seafood Kottu', price: 40000, description: 'Mixed seafood kottu', category: 'Non-Veg' },
        { name: 'Chicken Biriyani', price: 38000, description: 'Aromatic chicken biriyani', category: 'Non-Veg' },
        { name: 'Mutton Biriyani', price: 48000, description: 'Rich mutton biriyani', category: 'Non-Veg' },
        { name: 'Dum Biriyani', price: 42000, description: 'Special dum biriyani', category: 'Non-Veg' },
        { name: 'Chicken Fried Rice', price: 32000, description: 'Sizzling chicken fried rice', category: 'Non-Veg' }
      ]
    },
    {
      name: 'Hari Milk Soda',
      cuisineType: 'Beverages',
      description: 'Fresh milk soda varieties',
      menuItems: [
        { name: 'Grapes Milk Soda', price: 10000, description: 'Refreshing grapes milk soda', category: 'Veg' },
        { name: 'Dates Milk Soda', price: 12000, description: 'Sweet dates milk soda', category: 'Veg' },
        { name: 'Badam Milk Soda', price: 15000, description: 'Nutty badam milk soda', category: 'Veg' }
      ]
    },
    {
      name: 'Phoenix',
      cuisineType: 'Non-Veg',
      description: 'Multi-cuisine restaurant',
      menuItems: [
        { name: 'Chicken Kottu', price: 36000, description: 'Phoenix special chicken kottu', category: 'Non-Veg' },
        { name: 'Mutton Kottu', price: 46000, description: 'Phoenix special mutton kottu', category: 'Non-Veg' },
        { name: 'Seafood Kottu', price: 41000, description: 'Phoenix seafood kottu', category: 'Non-Veg' },
        { name: 'Chicken Biriyani', price: 39000, description: 'Phoenix chicken biriyani', category: 'Non-Veg' },
        { name: 'Mutton Biriyani', price: 49000, description: 'Phoenix mutton biriyani', category: 'Non-Veg' },
        { name: 'Dum Biriyani', price: 43000, description: 'Phoenix dum biriyani', category: 'Non-Veg' },
        { name: 'Chicken Fried Rice', price: 33000, description: 'Phoenix chicken fried rice', category: 'Non-Veg' }
      ]
    },
    {
      name: 'Sakthi Veg Restaurant',
      cuisineType: 'Veg',
      description: 'Pure vegetarian delights',
      menuItems: [
        { name: 'Dosa', price: 10000, description: 'Crispy south Indian dosa', category: 'Veg' },
        { name: 'Parota', price: 13000, description: 'Soft flaky parota', category: 'Veg' },
        { name: 'Idiyappam', price: 12000, description: 'String hoppers with curry', category: 'Veg' },
        { name: 'Rotti', price: 11000, description: 'Sri Lankan rotti', category: 'Veg' },
        { name: 'Noodles', price: 18000, description: 'Vegetable noodles', category: 'Veg' }
      ]
    },
    {
      name: 'KKJ Restaurant',
      cuisineType: 'Mixed',
      description: 'Multi-cuisine restaurant',
      menuItems: [
        { name: 'Chicken Kottu', price: 34000, description: 'KKJ special chicken kottu', category: 'Non-Veg' },
        { name: 'Mutton Kottu', price: 44000, description: 'KKJ special mutton kottu', category: 'Non-Veg' },
        { name: 'Seafood Kottu', price: 39000, description: 'KKJ seafood kottu', category: 'Non-Veg' },
        { name: 'Roll', price: 16000, description: 'KKJ special roll', category: 'Veg' },
        { name: 'Chicken Fried Rice', price: 31000, description: 'KKJ chicken fried rice', category: 'Non-Veg' }
      ]
    },
    {
      name: 'Pizza Cut',
      cuisineType: 'Pizza',
      description: 'Pizza specialists',
      menuItems: [
        { name: 'Margherita Pizza', price: 45000, description: 'Classic margherita pizza', category: 'Veg' },
        { name: 'Pepperoni Pizza', price: 55000, description: 'Spicy pepperoni pizza', category: 'Non-Veg' },
        { name: 'Veggie Pizza', price: 48000, description: 'Loaded vegetable pizza', category: 'Veg' },
        { name: 'Chicken Pizza', price: 58000, description: 'Chicken topping pizza', category: 'Non-Veg' },
        { name: 'Seafood Pizza', price: 65000, description: 'Seafood special pizza', category: 'Non-Veg' }
      ]
    }
  ],
  'Kodikamam': [
    {
      name: 'Kodikamam Kitchen',
      cuisineType: 'Mixed',
      description: 'Local cuisine specialties',
      menuItems: [
        { name: 'Rice & Curry', price: 25000, description: 'Local style rice and curry', category: 'Veg' },
        { name: 'Chicken Rice', price: 32000, description: 'Chicken with rice', category: 'Non-Veg' },
        { name: 'Vegetable Noodles', price: 20000, description: 'Stir fried vegetable noodles', category: 'Veg' }
      ]
    }
  ],
  'Meesalai': [
    {
      name: 'Meesalai Biryani House',
      cuisineType: 'Mixed',
      description: 'Biryani specialists',
      menuItems: [
        { name: 'Chicken Biryani', price: 36000, description: 'Aromatic chicken biryani', category: 'Non-Veg' },
        { name: 'Veg Biryani', price: 26000, description: 'Vegetable biryani', category: 'Veg' },
        { name: 'Mutton Biryani', price: 46000, description: 'Rich mutton biryani', category: 'Non-Veg' }
      ]
    }
  ],
  'Sangaththanai': [
    {
      name: 'Sangaththanai Cafe',
      cuisineType: 'Mixed',
      description: 'Cozy cafe',
      menuItems: [
        { name: 'Short Eats', price: 15000, description: 'Assorted short eats', category: 'Veg' },
        { name: 'Tea', price: 5000, description: 'Hot Ceylon tea', category: 'Veg' },
        { name: 'Coffee', price: 8000, description: 'Fresh coffee', category: 'Veg' }
      ]
    }
  ],
  'Chavakachcheri': [
    {
      name: 'Chavakachcheri Restaurant',
      cuisineType: 'Mixed',
      description: 'Family restaurant',
      menuItems: [
        { name: 'Family Meal', price: 120000, description: 'Meal for 4 people', category: 'Mixed' },
        { name: 'Kids Meal', price: 15000, description: 'Special meal for kids', category: 'Veg' },
        { name: 'Seafood Platter', price: 85000, description: 'Mixed seafood platter', category: 'Non-Veg' }
      ]
    }
  ]
};

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/trainfood');
    
    console.log('Connected to MongoDB');
    
    // Clear existing restaurants and products
    await Restaurant.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Create restaurants and products
    for (const [station, restaurants] of Object.entries(stationData)) {
      console.log(`\nProcessing station: ${station}`);
      
      for (const restaurantData of restaurants) {
        // Create restaurant
        const restaurant = await Restaurant.create({
          name: restaurantData.name,
          station: station,
          cuisineType: restaurantData.cuisineType,
          description: restaurantData.description,
          isActive: true
        });
        
        console.log(`Created restaurant: ${restaurant.name}`);
        
        // Create products for this restaurant
        for (const item of restaurantData.menuItems) {
          await Product.create({
            name: item.name,
            description: item.description,
            priceCents: item.price,
            available: true,
            station: station,
            restaurant: restaurant._id,
            category: item.category,
            deliveryTimeEstimate: '30 mins'
          });
        }
        
        console.log(`Created ${restaurantData.menuItems.length} menu items for ${restaurant.name}`);
      }
    }
    
    console.log('\n✅ Database seeded successfully!');
    
    // Show summary
    const totalRestaurants = await Restaurant.countDocuments();
    const totalProducts = await Product.countDocuments();
    console.log(`\nSummary:`);
    console.log(`- Total Restaurants: ${totalRestaurants}`);
    console.log(`- Total Products: ${totalProducts}`);
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedData();
