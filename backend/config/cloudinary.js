const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if Cloudinary is configured
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME && 
                               process.env.CLOUDINARY_API_KEY && 
                               process.env.CLOUDINARY_API_SECRET;

let upload;
let deleteImage;

if (isCloudinaryConfigured) {
  // Configure cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Create cloudinary storage for multer
  const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'bayader-bakery', // Folder name in cloudinary
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }] // Optimize images
    }
  });

  // Create multer upload middleware
  upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  // Helper function to delete image from cloudinary
  deleteImage = async (publicId) => {
    try {
      await cloudinary.uploader.destroy(publicId);
      return { success: true };
    } catch (error) {
      console.error('Error deleting image from cloudinary:', error);
      return { success: false, error: error.message };
    }
  };

} else {
  // LOCAL STORAGE FALLBACK
  console.log('⚠️ Cloudinary not configured. Using local storage.');

  // Ensure upload directory exists
  const uploadDir = 'uploads';
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      // Create unique filename: timestamp-random.ext
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
  });

  upload = multer({
    storage: storage,
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB limit
    }
  });

  deleteImage = async (filename) => {
    try {
      const filepath = path.join(uploadDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return { success: true };
      }
      return { success: true, message: 'File not found locally' };
    } catch (error) {
      console.error('Error deleting local image:', error);
      return { success: false, error: error.message };
    }
  };
}

module.exports = {
  cloudinary,
  upload,
  deleteImage,
  isCloudinaryConfigured
};
