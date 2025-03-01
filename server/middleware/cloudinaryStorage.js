const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'prescriptions', // folder name in cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'] // allowed formats
  }
});

// Create multer upload instance
const upload = multer({ storage: storage });

module.exports = upload; 