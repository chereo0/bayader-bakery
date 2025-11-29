const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

async function testApi() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bayader');
    console.log('✅ Connected to MongoDB');

    // Test 1: Count all products
    const totalCount = await Product.countDocuments({});
    console.log(`\n📊 Total products in database: ${totalCount}`);

    // Test 2: Count Active products
    const activeCount = await Product.countDocuments({ status: 'Active' });
    console.log(`✅ Active products: ${activeCount}`);

    // Test 3: Show all Active products
    const activeProducts = await Product.find({ status: 'Active' }, 'name category price status').lean();
    console.log(`\n📦 All Active products:`);
    console.log(JSON.stringify(activeProducts, null, 2));

    // Test 4: Check status values of all products
    const allProducts = await Product.find({}, 'name status').lean();
    const statusMap = {};
    allProducts.forEach(p => {
      statusMap[p.status || 'UNDEFINED'] = (statusMap[p.status || 'UNDEFINED'] || 0) + 1;
    });
    console.log(`\n📈 Products by status:`);
    console.log(JSON.stringify(statusMap, null, 2));

    // Test 5: Check categories of Active products
    const categoryCounts = await Product.aggregate([
      { $match: { status: 'Active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log(`\n📂 Active products by category:`);
    console.log(JSON.stringify(categoryCounts, null, 2));

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

testApi();
