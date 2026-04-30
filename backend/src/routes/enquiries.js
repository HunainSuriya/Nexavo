const express = require('express');
const router = express.Router();
const {
  submitEnquiry,
  getAllEnquiries,
  getEnquiryById,
  deleteEnquiry,
} = require('../controllers/enquiryController');
const authMiddleware = require('../middleware/auth');
const { validateEnquiry } = require('../utils/validation');

// Public routes
router.post('/', validateEnquiry, submitEnquiry);

// Protected routes (Admin only)
router.get('/', authMiddleware, getAllEnquiries);
router.get('/:id', authMiddleware, getEnquiryById);
router.delete('/:id', authMiddleware, deleteEnquiry);

module.exports = router;