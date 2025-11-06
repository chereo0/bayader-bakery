#!/usr/bin/env node
/**
 * Enhanced MongoDB connection test script
 * Outputs detailed connection error info for debugging Atlas access issues
 */

const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function test() {
  console.log('\n=== MongoDB Connection Diagnostic ===\n');

  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  const sanitizedUri = uri ? uri.replace(/:[^@]+@/, ':***@') : null;

  console.log('📋 Configuration:');
  console.log(`   URI (sanitized): ${sanitizedUri || 'NOT SET'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
  console.log(`   Timeout: 5000ms\n`);

  if (!uri) {
    console.error('❌ ERROR: No MongoDB URI found in environment variables');
    process.exit(1);
  }

  try {
    console.log('🔄 Attempting connection...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log('✅ SUCCESS: Connected to MongoDB!');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    console.log(`   State: ${mongoose.connection.readyState}\n`);

    await mongoose.disconnect();
    console.log('✅ Disconnected successfully.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error Type:', err.name);
    console.error('Error Message:', err.message);
    console.error('\nFull Error Object:');
    console.error(JSON.stringify(err, null, 2));
    console.error('\n📌 Common causes:');
    console.error('   1. Your IP is not in Atlas IP Access List');
    console.error('   2. IP Access List entry has not propagated yet (wait 2-5 min)');
    console.error('   3. Your public IP changed (check with: Invoke-RestMethod -Uri "https://api.ipify.org")');
    console.error('   4. Network/firewall blocking outbound port 27017\n');
    process.exit(1);
  }
}

test();
