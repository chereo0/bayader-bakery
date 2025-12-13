const mongoose = require('mongoose');
const Material = require('../models/Material');
require('dotenv').config();

const materials = [
  {
    name: 'Flour',
    description: 'All-purpose wheat flour for baking',
    currentStock: 100,
    reorderLevel: 20,
    maxStock: 200,
    unit: 'kg',
    costPerUnit: 2.5,
    supplier: 'Local Mill Co.',
    isActive: true
  },
  {
    name: 'Sugar',
    description: 'Granulated white sugar',
    currentStock: 50,
    reorderLevel: 10,
    maxStock: 100,
    unit: 'kg',
    costPerUnit: 3.0,
    supplier: 'Sweet Suppliers Ltd.',
    isActive: true
  },
  {
    name: 'Butter',
    description: 'Unsalted butter for pastries and cakes',
    currentStock: 30,
    reorderLevel: 5,
    maxStock: 50,
    unit: 'kg',
    costPerUnit: 8.0,
    supplier: 'Dairy Fresh Co.',
    isActive: true
  },
  {
    name: 'Eggs',
    description: 'Fresh large eggs',
    currentStock: 200,
    reorderLevel: 50,
    maxStock: 500,
    unit: 'units',
    costPerUnit: 0.5,
    supplier: 'Farm Fresh Eggs',
    isActive: true
  },
  {
    name: 'Milk',
    description: 'Whole milk for baking',
    currentStock: 40,
    reorderLevel: 10,
    maxStock: 80,
    unit: 'liters',
    costPerUnit: 1.5,
    supplier: 'Dairy Fresh Co.',
    isActive: true
  },
  {
    name: 'Chocolate',
    description: 'Dark chocolate for cakes and decorations',
    currentStock: 15,
    reorderLevel: 5,
    maxStock: 30,
    unit: 'kg',
    costPerUnit: 12.0,
    supplier: 'Chocolate Heaven',
    isActive: true
  },
  {
    name: 'Vanilla Extract',
    description: 'Pure vanilla extract',
    currentStock: 8,
    reorderLevel: 2,
    maxStock: 15,
    unit: 'liters',
    costPerUnit: 20.0,
    supplier: 'Flavor Essentials',
    isActive: true
  },
  {
    name: 'Almond Flour',
    description: 'Finely ground almond flour for gluten-free baking',
    currentStock: 12,
    reorderLevel: 5,
    maxStock: 25,
    unit: 'kg',
    costPerUnit: 10.0,
    supplier: 'Nut & Grain Suppliers',
    isActive: true
  }
];

async function seedMaterials() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bayader-bakery');
    console.log('✅ Connected to MongoDB');
    
    // Check if materials already exist
    const existingCount = await Material.countDocuments();
    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing materials`);
      console.log('Do you want to replace them? This will DELETE all existing materials.');
      console.log('Comment out the deleteMany line below to keep existing data.');
    }
    
    // Clear existing materials (comment this line to keep existing data)
    await Material.deleteMany({});
    console.log('🗑️  Cleared existing materials');
    
    // Insert new materials
    const inserted = await Material.insertMany(materials);
    console.log(`✅ Successfully inserted ${inserted.length} materials:`);
    
    inserted.forEach((m, index) => {
      console.log(`  ${index + 1}. ${m.name} (${m.currentStock} ${m.unit})`);
    });
    
    console.log('\n📊 Summary:');
    console.log(`   Total materials: ${inserted.length}`);
    console.log(`   Low stock items: ${inserted.filter(m => m.currentStock <= m.reorderLevel).length}`);
    console.log(`   Active items: ${inserted.filter(m => m.isActive).length}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding materials:', error);
    process.exit(1);
  }
}

// Run the seed function
seedMaterials();
