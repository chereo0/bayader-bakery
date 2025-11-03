require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const config = require('../config');

const sampleProducts = [
  {
    name: 'Classic Chocolate Cake',
    category: 'Cakes',
    image: '/images/cakes.jpg',
    description: 'Rich and moist chocolate cake with smooth ganache frosting. Perfect for celebrations.',
    price: 29.99,
    stock: 15,
    status: 'Active',
    ingredients: ['Flour', 'Sugar', 'Cocoa Powder', 'Eggs', 'Butter', 'Milk'],
  },
  {
    name: 'Vanilla Cupcakes',
    category: 'Pastries',
    image: '/images/pastries.jpg',
    description: 'Light and fluffy vanilla cupcakes topped with buttercream frosting.',
    price: 12.5,
    stock: 25,
    status: 'Active',
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Vanilla Extract'],
  },
  {
    name: 'Artisan Sourdough Bread',
    category: 'Breads',
    image: '/images/bread.jpg',
    description: 'Traditional sourdough with a crispy crust and soft interior.',
    price: 8.99,
    stock: 20,
    status: 'Active',
    ingredients: ['Flour', 'Water', 'Salt', 'Sourdough Starter'],
  },
  {
    name: 'Chocolate Chip Cookies',
    category: 'Cookies',
    image: '/images/cookies.jpg',
    description: 'Classic chocolate chip cookies, soft and chewy.',
    price: 15.99,
    stock: 30,
    status: 'Active',
    ingredients: ['Flour', 'Sugar', 'Butter', 'Chocolate Chips', 'Eggs'],
  },
  {
    name: 'Red Velvet Cake',
    category: 'Cakes',
    image: '/images/cakes.jpg',
    description: 'Beautiful red velvet cake with cream cheese frosting.',
    price: 34.99,
    stock: 10,
    status: 'Active',
    ingredients: ['Flour', 'Sugar', 'Cocoa', 'Buttermilk', 'Red Food Coloring', 'Cream Cheese'],
  },
  {
    name: 'Croissants',
    category: 'Pastries',
    image: '/images/pastries.jpg',
    description: 'Buttery, flaky French croissants baked fresh daily.',
    price: 4.99,
    stock: 40,
    status: 'Active',
    ingredients: ['Flour', 'Butter', 'Milk', 'Yeast', 'Sugar'],
  },
  {
    name: 'Cinnamon Rolls',
    category: 'Pastries',
    image: '/images/pastries.jpg',
    description: 'Warm cinnamon rolls with cream cheese glaze.',
    price: 18.99,
    stock: 8,
    status: 'Active',
    ingredients: ['Flour', 'Sugar', 'Cinnamon', 'Butter', 'Cream Cheese', 'Milk'],
  },
  {
    name: 'Seasonal Fruit Tart',
    category: 'Seasonal',
    image: '/images/seasonal.jpg',
    description: 'Fresh seasonal fruits on custard filling with a buttery crust.',
    price: 26.99,
    stock: 12,
    status: 'Active',
    ingredients: ['Flour', 'Butter', 'Eggs', 'Cream', 'Fresh Fruits', 'Sugar'],
  },
  {
    name: 'Whole Wheat Bread',
    category: 'Breads',
    image: '/images/bread.jpg',
    description: 'Healthy whole wheat bread, perfect for sandwiches.',
    price: 6.99,
    stock: 18,
    status: 'Active',
    ingredients: ['Whole Wheat Flour', 'Water', 'Yeast', 'Honey', 'Salt'],
  },
  {
    name: 'Custom Wedding Cake',
    category: 'Custom Orders',
    image: '/images/cakes.jpg',
    description: 'Elegant multi-tier wedding cake. Contact us for custom designs.',
    price: 299.99,
    stock: 0,
    status: 'Out of Stock',
    ingredients: ['Flour', 'Sugar', 'Eggs', 'Butter', 'Custom Decorations'],
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to database...');
    await mongoose.connect(config.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    console.log('✅ Products cleared');

    // Create admin user if doesn't exist
    const adminEmail = 'admin@bayader.com';
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (!adminUser) {
      console.log('👤 Creating admin user...');
      adminUser = await User.create({
        name: 'Admin User',
        email: adminEmail,
        password: 'admin123',
        role: 'admin',
        phone: '+1234567890',
      });
      console.log(`✅ Admin user created: ${adminEmail} / admin123`);
    } else {
      console.log('✅ Admin user already exists');
    }

    // Create staff user if doesn't exist
    const staffEmail = 'staff@bayader.com';
    let staffUser = await User.findOne({ email: staffEmail });
    if (!staffUser) {
      console.log('👤 Creating staff user...');
      staffUser = await User.create({
        name: 'Staff Member',
        email: staffEmail,
        password: 'staff123',
        role: 'staff',
        phone: '+1234560001',
      });
      console.log(`✅ Staff user created: ${staffEmail} / staff123`);
    } else {
      console.log('✅ Staff user already exists');
    }

    // Create driver user if doesn't exist
    const driverEmail = 'driver@bayader.com';
    let driverUser = await User.findOne({ email: driverEmail });
    if (!driverUser) {
      console.log('👤 Creating driver user...');
      driverUser = await User.create({
        name: 'Delivery Driver',
        email: driverEmail,
        password: 'driver123',
        role: 'driver',
        phone: '+1234560002',
      });
      console.log(`✅ Driver user created: ${driverEmail} / driver123`);
    } else {
      console.log('✅ Driver user already exists');
    }

    // Create sample products
    console.log('🍰 Creating sample products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ ${createdProducts.length} products created`);

    // Update related products (link first two products)
    if (createdProducts.length >= 2) {
      await Product.findByIdAndUpdate(createdProducts[0]._id, {
        relatedProducts: [createdProducts[1]._id],
      });
      await Product.findByIdAndUpdate(createdProducts[1]._id, {
        relatedProducts: [createdProducts[0]._id],
      });
      console.log('✅ Related products linked');
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Admin: ${adminEmail} (password: admin123)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
