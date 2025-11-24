/**
 * Order Number Generator Utility
 * 
 * Handles auto-generation of unique order numbers using MongoDB counters.
 * This ensures no duplicate order numbers are created.
 */

const mongoose = require('mongoose');

// Counter schema for tracking order number sequences
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  sequence_value: { type: Number, default: 0 },
}, { collection: 'counters' });

const Counter = mongoose.model('Counter', counterSchema);

/**
 * Get the next unique order number
 * Uses MongoDB counter to ensure atomicity
 * 
 * @returns {Promise<string>} Unique order number (e.g., "ORD-0000001")
 */
async function getNextOrderNumber() {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'orderNumber',
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    return `ORD-${String(counter.sequence_value).padStart(7, '0')}`;
  } catch (error) {
    // Fallback: Generate timestamp-based unique number
    console.warn('⚠️ Counter increment failed, using fallback:', error.message);
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    return `ORD-${timestamp}${String(random).padStart(4, '0')}`;
  }
}

/**
 * Reset counter (admin only - use with caution)
 * 
 * @param {number} startNumber - Number to start from (default: 0)
 * @returns {Promise<Object>} Updated counter
 */
async function resetOrderNumberCounter(startNumber = 0) {
  try {
    const counter = await Counter.findByIdAndUpdate(
      'orderNumber',
      { sequence_value: startNumber },
      { new: true, upsert: true }
    );
    console.log(`✅ Order number counter reset to ${startNumber}`);
    return counter;
  } catch (error) {
    console.error('❌ Failed to reset counter:', error.message);
    throw error;
  }
}

/**
 * Get current order number sequence
 * 
 * @returns {Promise<number>} Current sequence value
 */
async function getCurrentOrderNumberSequence() {
  try {
    const counter = await Counter.findById('orderNumber');
    return counter ? counter.sequence_value : 0;
  } catch (error) {
    console.error('❌ Failed to get current sequence:', error.message);
    return 0;
  }
}

module.exports = {
  getNextOrderNumber,
  resetOrderNumberCounter,
  getCurrentOrderNumberSequence,
};
