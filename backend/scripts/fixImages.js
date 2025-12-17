require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const { connectDB } = require('../config/db');

// Path where local uploads are stored
const UPLOADS_DIR = path.join(__dirname, '../uploads');
const DEFAULT_IMAGE = '/images/placeholder.jpg';

const fixImages = async () => {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected.');

    console.log('🔍 Scanning products for broken images...');
    const products = await Product.find({});
    
    let fixedCount = 0;
    let brokenCount = 0;

    for (const product of products) {
      let isModified = false;
      const imageUrl = product.image;

      if (!imageUrl || imageUrl === DEFAULT_IMAGE) continue;

      // Case 1: Local file path (e.g., /uploads/xyz.png)
      if (imageUrl.includes('/uploads/')) {
        const filename = imageUrl.split('/uploads/').pop();
        const localPath = path.join(UPLOADS_DIR, filename);

        if (!fs.existsSync(localPath)) {
          console.log(`❌ Missing local file for product "${product.name}": ${imageUrl}`);
          // brokenCount++;
          // product.image = DEFAULT_IMAGE;
          // isModified = true;
          
          // Actually, since we switched back to Cloudinary, maybe we should just clear these bad local paths?
          // Let's check if it's a valid URL at least. 
          // If it's a local URL "http://localhost:5000/uploads/..." and file is missing, it's broken.
          
           brokenCount++;
           product.image = DEFAULT_IMAGE; // Revert to placeholder
           isModified = true;
        }
      } 
      // Case 2: Cloudinary URL (starts with http but not localhost/uploads)
      else if (imageUrl.startsWith('http') && !imageUrl.includes('/uploads/')) {
          // Verify if it looks like a valid Cloudinary URL? 
          // For now assume valid if it's external.
      }
      
      // Also check 'images' array
      if (product.images && product.images.length > 0) {
          const validImages = [];
          for (const img of product.images) {
              if (img.includes('/uploads/')) {
                   const fname = img.split('/uploads/').pop();
                   if (fs.existsSync(path.join(UPLOADS_DIR, fname))) {
                       validImages.push(img);
                   } else {
                       console.log(`❌ Removing missing gallery image for "${product.name}": ${img}`);
                       isModified = true;
                   }
              } else {
                  validImages.push(img);
              }
          }
          if (product.images.length !== validImages.length) {
              product.images = validImages;
              isModified = true;
          }
      }

      if (isModified) {
        await product.save();
        fixedCount++;
        console.log(`✅ Fixed product: ${product.name}`);
      }
    }

    console.log('-----------------------------------');
    console.log(`🏁 Done! Found ${brokenCount} broken main images.`);
    console.log(`✨ Fixed ${fixedCount} products.`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixImages();
