#!/usr/bin/env node

/**
 * Create Driver Account Script
 * Usage: node scripts/create-driver.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise(resolve => rl.question(query, resolve));

async function createDriver() {
  try {
    console.log('\n========== Bayader Bakery - Create Driver Account ==========\n');

    // Connect to database
    console.log('Connecting to database...');
    await mongoose.connect(config.MONGODB_URI);
    console.log('✓ Connected to database\n');

    // Get driver information
    const name = await question('Enter driver name: ');
    const email = await question('Enter driver email: ');
    const password = await question('Enter driver password (min 6 chars): ');
    const phone = await question('Enter driver phone (with country code): ');
    const address = await question('Enter driver address: ');

    // Validate inputs
    if (!name || !email || !password || !phone) {
      throw new Error('Name, email, password, and phone are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      throw new Error('Invalid email format');
    }

    // Check if driver already exists
    const existing = await User.findOne({ email });
    if (existing) {
      throw new Error(`Driver with email ${email} already exists`);
    }

    // Create driver
    console.log('\nCreating driver account...');
    const driver = await User.create({
      name,
      email,
      password,
      phone,
      address,
      role: 'driver',
      department: 'Delivery'
    });

    console.log('\n✓ Driver account created successfully!\n');
    console.log('Driver Details:');
    console.log('===============');
    console.log(`ID:         ${driver._id}`);
    console.log(`Name:       ${driver.name}`);
    console.log(`Email:      ${driver.email}`);
    console.log(`Phone:      ${driver.phone}`);
    console.log(`Address:    ${driver.address}`);
    console.log(`Role:       ${driver.role}`);
    console.log(`Department: ${driver.department}`);
    console.log(`Created:    ${driver.createdAt}\n`);

    console.log('Driver can now login with:');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}\n`);

  } catch (err) {
    console.error('\n✗ Error:', err.message, '\n');
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.connection.close();
  }
}

createDriver();
