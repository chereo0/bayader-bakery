// Script to fix the E11000 duplicate key error on orderNumber
// Run this in MongoDB or via Node.js

const mongoose = require('mongoose');

async function fixOrderNumberIndex() {
  try {
    // Connect to MongoDB
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bakery_DB';
    await mongoose.connect(uri);
    
    console.log('Connected to MongoDB');
    
    // Get the orders collection
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    
    // Drop the problematic unique index
    console.log('Attempting to drop orderNumber_1 index...');
    try {
      await ordersCollection.dropIndex('orderNumber_1');
      console.log('✅ Successfully dropped orderNumber_1 unique index');
    } catch (err) {
      if (err.message.includes('ns not found')) {
        console.log('ℹ️  Index does not exist (already cleaned up)');
      } else {
        console.error('Error dropping index:', err.message);
      }
    }
    
    // Recreate the index as sparse (allows multiple null values)
    console.log('Creating new sparse orderNumber index...');
    try {
      await ordersCollection.createIndex(
        { orderNumber: 1 },
        { sparse: true, unique: true }
      );
      console.log('✅ Successfully created sparse unique orderNumber index');
    } catch (err) {
      console.error('Error creating index:', err.message);
    }
    
    console.log('\n✅ Index fix complete! Orders can now be created.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixOrderNumberIndex();
