// Script to completely fix the orderNumber index issue
// This will drop all problematic indexes and let Mongoose recreate them

const mongoose = require('mongoose');

async function completelyFixOrderIndex() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/bakery_DB';
    await mongoose.connect(uri);
    
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const ordersCollection = db.collection('orders');
    
    // Get all indexes using listIndexes
    const indexCursor = await ordersCollection.listIndexes();
    const indexes = await indexCursor.toArray();
    console.log('\n📊 Current indexes:');
    indexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));
    
    // Drop ALL indexes except _id_
    console.log('\n🔍 Dropping all non-_id indexes...');
    for (const idx of indexes) {
      if (idx.name !== '_id_') {
        console.log(`  - Dropping index: ${idx.name}`);
        try {
          await ordersCollection.dropIndex(idx.name);
          console.log(`    ✅ Dropped: ${idx.name}`);
        } catch (err) {
          console.error(`    ❌ Error dropping ${idx.name}:`, err.message);
        }
      }
    }
    
    // Verify all indexes are gone
    const remainingCursor = await ordersCollection.listIndexes();
    const remainingIndexes = await remainingCursor.toArray();
    console.log('\n📊 Remaining indexes after cleanup:');
    remainingIndexes.forEach(idx => console.log(`  - ${idx.name}:`, idx.key));
    
    console.log('\n✅ Complete index cleanup done!');
    console.log('⚠️  Now update the Order model to remove unique constraint and restart backend.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

completelyFixOrderIndex();
