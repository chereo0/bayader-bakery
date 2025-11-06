/**
 * Migration script: Merge 'test' database into 'bakery_DB'
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Copies all collections from 'test' to 'bakery_DB'
 * 3. Deletes the 'test' database
 * 
 * Usage: node scripts/migrate-test-db.js
 */

const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

async function migrate() {
  let client;
  try {
    logger.info('Starting database migration...');
    logger.info(`Connecting to MongoDB: ${config.MONGO_URI.replace(/:[^@]+@/, ':***@')}`);

    // Connect directly via mongoose
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });

    const connection = mongoose.connection;
    logger.info('Connected to MongoDB');

    // Get the raw MongoDB driver to access multiple databases
    const db = connection.getClient();

    // Get references to both databases
    const testDb = db.db('test');
    const bakeryDb = db.db('bakery_DB');

    logger.info('Fetching collections from "test" database...');
    const collections = await testDb.listCollections().toArray();
    const collectionNames = collections.map((c) => c.name);

    if (collectionNames.length === 0) {
      logger.info('No collections found in "test" database. Skipping migration.');
    } else {
      logger.info(`Found ${collectionNames.length} collections: ${collectionNames.join(', ')}`);

      for (const collectionName of collectionNames) {
        try {
          logger.info(`Migrating collection: ${collectionName}...`);

          // Get source and destination collections
          const sourceCollection = testDb.collection(collectionName);
          const destCollection = bakeryDb.collection(collectionName);

          // Get count of documents
          const docCount = await sourceCollection.countDocuments();
          logger.info(`  Found ${docCount} documents in test.${collectionName}`);

          if (docCount === 0) {
            logger.info(`  Skipping empty collection: ${collectionName}`);
            continue;
          }

          // Fetch all documents from source
          const documents = await sourceCollection.find({}).toArray();

          // Insert into destination (upsert by _id to avoid duplicates)
          const bulkOps = documents.map((doc) => ({
            updateOne: {
              filter: { _id: doc._id },
              update: { $set: doc },
              upsert: true,
            },
          }));

          const result = await destCollection.bulkWrite(bulkOps);
          logger.info(
            `  ✓ Migrated ${collectionName}: ${result.upsertedCount} inserted, ${result.modifiedCount} updated`
          );
        } catch (err) {
          logger.error(`  ✗ Error migrating collection ${collectionName}:`, err.message);
        }
      }

      logger.info('All collections migrated. Deleting "test" database...');
      await testDb.dropDatabase();
      logger.info('✓ "test" database deleted successfully');
    }

    logger.info('✓ Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    logger.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      logger.info('Disconnected from MongoDB');
    }
  }
}

migrate();
