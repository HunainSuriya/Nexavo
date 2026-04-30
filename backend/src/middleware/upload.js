const multer = require('multer');
const path = require('path');
const env = require('../config/env');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (env.upload.allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and SVG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: env.upload.maxSize },
  fileFilter: fileFilter,
});

module.exports = upload;