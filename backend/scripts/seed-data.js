#!/usr/bin/env node
/**
 * Seed script to generate test data for dashboard
 * Creates sample orders, deliveries, and reviews to populate analytics
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const User = require('./models/User');
    const Product = require('./models/Product');
    const Order = require('./models/Order');
    const Event = require('./models/Event');

    // Get sample data
    const users = await User.find().limit(3);
    const products = await Product.find().limit(5);

    if (!users.length) {
      console.warn('⚠️  No users found. Creating test user...');
      const testUser = await User.create({
        name: 'Test Customer',
        email: 'test@example.com',
        password: 'hashed_password',
        role: 'customer'
      });
      users.push(testUser);
    }

    if (!products.length) {
      console.warn('⚠️  No products found. Skipping order creation.');
      process.exit(0);
    }

    console.log(`📦 Using ${users.length} users and ${products.length} products`);

    // Generate 15 sample orders spread across the last 30 days
    const now = new Date();
    const orders = [];

    for (let i = 0; i < 15; i++) {
      const daysAgo = Math.floor(Math.random() * 30);
      const orderDate = new Date(now);
      orderDate.setDate(orderDate.getDate() - daysAgo);

      // Random 1-3 products per order
      const itemCount = Math.floor(Math.random() * 3) + 1;
      const items = [];
      let totalPrice = 0;

      for (let j = 0; j < itemCount; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const price = product.price || 15;
        totalPrice += price * quantity;

        items.push({
          productId: product._id,
          name: product.name,
          price,
          quantity
        });
      }

      const statuses = ['pending', 'completed', 'cancelled'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      const order = new Order({
        user: users[Math.floor(Math.random() * users.length)]._id,
        items,
        totalPrice,
        status,
        createdAt: orderDate,
        updatedAt: orderDate
      });

      orders.push(order);
    }

    // Save all orders
    const savedOrders = await Order.insertMany(orders);
    console.log(`✅ Created ${savedOrders.length} test orders`);

    // Add sample reviews to products
    const reviewsAdded = [];
    for (const product of products) {
      const reviewCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < reviewCount; i++) {
        const rating = Math.floor(Math.random() * 4) + 2; // 2-5 stars
        const reviews = [
          'Great product! Will buy again.',
          'Excellent quality and taste.',
          'Highly recommend!',
          'Very fresh and delicious.',
          'Perfect for the occasion.',
          'Loved it!',
          'Amazing service.'
        ];

        if (!product.reviews) product.reviews = [];
        product.reviews.push({
          userName: users[Math.floor(Math.random() * users.length)].name,
          comment: reviews[Math.floor(Math.random() * reviews.length)],
          rating,
          createdAt: new Date()
        });
      }
      await product.save();
      reviewsAdded.push(product.name);
    }

    console.log(`✅ Added reviews to ${reviewsAdded.length} products`);

    // Update low stock items
    const lowStockCount = Math.floor(products.length / 2);
    for (let i = 0; i < lowStockCount; i++) {
      products[i].stock = Math.floor(Math.random() * 5); // 0-4 items (low stock)
      await products[i].save();
    }
    console.log(`✅ Updated stock levels for ${lowStockCount} products`);

    console.log('\n✅ Seed data created successfully!');
    console.log('📊 Dashboard should now show:');
    console.log('   - Total Sales (sum of order totals)');
    console.log('   - New Orders (15 test orders)');
    console.log('   - Low Stock Alerts');
    console.log('   - Customer Reviews');
    console.log('\nRestart your backend and refresh the dashboard to see the data.\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding data:', err.message);
    process.exit(1);
  }
}

seedData();
