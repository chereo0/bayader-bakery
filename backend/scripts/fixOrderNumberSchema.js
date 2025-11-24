#!/usr/bin/env node
/**
 * MongoDB Index Cleanup & Fix Script
 * 
 * This script:
 * 1. Removes all old problematic indexes from the orders collection
 * 2. Removes all null/undefined orderNumber documents
 * 3. Recreates the proper unique index on orderNumber
 * 4. Sets up the counters collection
 * 
 * Run this once after updating the Order model.
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bakery_DB';

async function cleanupAndFix() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    const countersCollection = db.collection('counters');

    // Step 1: List existing indexes
    console.log('📊 Current indexes on orders collection:');
    const existingIndexes = await ordersCollection.listIndexes().toArray();
    console.log(existingIndexes.map(idx => `  • ${idx.name}: ${JSON.stringify(idx.key)}`).join('\n'));
    console.log();

    // Step 2: Drop all non-_id indexes
    console.log('🗑️  Dropping old indexes (except _id)...');
    const indexNames = existingIndexes
      .filter(idx => idx.name !== '_id_')
      .map(idx => idx.name);

    for (const indexName of indexNames) {
      try {
        await ordersCollection.dropIndex(indexName);
        console.log(`  ✅ Dropped: ${indexName}`);
      } catch (err) {
        console.log(`  ⚠️  Skipped: ${indexName} (${err.message})`);
      }
    }
    console.log();

    // Step 3: Remove orders with null/undefined orderNumber
    console.log('🧹 Cleaning up orders with null orderNumber...');
    const deleteResult = await ordersCollection.deleteMany({
      $or: [
        { orderNumber: null },
        { orderNumber: undefined },
        { orderNumber: { $exists: false } }
      ]
    });
    console.log(`  ✅ Deleted ${deleteResult.deletedCount} orders with null orderNumber\n`);

    // Step 4: Create new clean indexes
    console.log('📝 Creating new indexes...');
    try {
      await ordersCollection.createIndex({ orderNumber: 1 }, { unique: true });
      console.log('  ✅ Created unique index on orderNumber');
    } catch (err) {
      console.log(`  ⚠️  Could not create index: ${err.message}`);
    }

    try {
      await ordersCollection.createIndex({ user: 1, createdAt: -1 });
      console.log('  ✅ Created index on user + createdAt');
    } catch (err) {
      console.log(`  ⚠️  Skipped: ${err.message}`);
    }

    try {
      await ordersCollection.createIndex({ status: 1 });
      console.log('  ✅ Created index on status');
    } catch (err) {
      console.log(`  ⚠️  Skipped: ${err.message}`);
    }

    try {
      await ordersCollection.createIndex({ createdAt: -1 });
      console.log('  ✅ Created index on createdAt');
    } catch (err) {
      console.log(`  ⚠️  Skipped: ${err.message}`);
    }
    console.log();

    // Step 5: Initialize counter collection
    console.log('🔢 Setting up order number counter...');
    
    // Get max sequence from existing orders
    const maxOrderResult = await ordersCollection
      .find({ orderNumber: { $exists: true, $ne: null } })
      .sort({ _id: -1 })
      .limit(1)
      .toArray();

    let startSequence = 1;
    if (maxOrderResult.length > 0) {
      const lastOrderNumber = maxOrderResult[0].orderNumber;
      const match = lastOrderNumber.match(/\d+/);
      if (match) {
        startSequence = parseInt(match[0]) + 1;
      }
    }

    await countersCollection.updateOne(
      { _id: 'orderNumber' },
      { $set: { sequence_value: startSequence } },
      { upsert: true }
    );
    console.log(`  ✅ Counter initialized with sequence value: ${startSequence}\n`);

    // Step 6: Verify new indexes
    console.log('✅ Final index status:');
    const newIndexes = await ordersCollection.listIndexes().toArray();
    console.log(newIndexes.map(idx => `  • ${idx.name}: ${JSON.stringify(idx.key)}`).join('\n'));
    console.log();

    // Step 7: Summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ DATABASE CLEANUP COMPLETE!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('\nNext steps:');
    console.log('1. Restart your backend server (npm run dev)');
    console.log('2. Try creating a new order from the frontend');
    console.log('3. Orders should now have unique orderNumbers like "ORD-0000001"');
    console.log('4. No more E11000 errors! 🎉\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

// Run the cleanup
cleanupAndFix();
