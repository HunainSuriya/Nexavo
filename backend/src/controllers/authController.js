const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const env = require('../config/env');
const { validationResult } = require('express-validator');

// Admin login
const login = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { username, password } = req.body;
    
    // Find admin
    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Verify password
    const isValid = await Admin.verifyPassword(password, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      env.jwt.secret,
      { expiresIn: env.jwt.expire }
    );
    
    res.json({
      success: true,
      token,
      admin: { id: admin.id, username: admin.username }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Verify token
const verify = async (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// Change password (Admin only)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const adminId = req.admin.id;
    
    // Get admin from database
    const result = await pool.query('SELECT * FROM admins WHERE id = $1', [adminId]);
    const admin = result.rows[0];
    
    // Verify current password
    const isValid = await Admin.verifyPassword(currentPassword, admin.password_hash);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query('UPDATE admins SET password_hash = $1 WHERE id = $2', [hashedPassword, adminId]);
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};

module.exports = { login, verify, changePassword };