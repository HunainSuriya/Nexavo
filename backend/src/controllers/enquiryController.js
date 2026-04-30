const Enquiry = require('../models/Enquiry');
const { sendContactEmail } = require('../utils/emailService');
const { validationResult } = require('express-validator');

// Submit contact form
const submitEnquiry = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { client_name, email, project_type, message } = req.body;
    
    // Save to database
    const enquiry = await Enquiry.create({
      client_name,
      email,
      project_type: project_type || null,
      message,
    });
    
    // Send email notifications
    await sendContactEmail({ client_name, email, project_type, message });
    
    res.status(201).json({ 
      success: true, 
      message: 'Enquiry submitted successfully. We will contact you soon!',
      enquiry 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to submit enquiry' });
  }
};

// Get all enquiries (Admin only)
const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await Enquiry.getAll();
    res.json({ success: true, enquiries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch enquiries' });
  }
};

// Get single enquiry (Admin only)
const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.getById(id);
    
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    
    res.json({ success: true, enquiry });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch enquiry' });
  }
};

// Delete enquiry (Admin only)
const deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const enquiry = await Enquiry.getById(id);
    
    if (!enquiry) {
      return res.status(404).json({ error: 'Enquiry not found' });
    }
    
    await Enquiry.delete(id);
    res.json({ success: true, message: 'Enquiry deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete enquiry' });
  }
};

module.exports = {
  submitEnquiry,
  getAllEnquiries,
  getEnquiryById,
  deleteEnquiry,
};