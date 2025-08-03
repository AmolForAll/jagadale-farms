const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all users
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = search ? {
      $or: [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ]
    } : {};

    const users = await User.find(query)
      .select('-password -resetPasswordOTP -resetPasswordOTPExpire -resetPasswordAttempts')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create user
router.post('/', [
  auth,
  body('username').isLength({ min: 3, max: 30 }).trim().withMessage('Username must be 3-30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('phone').matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit phone number'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('status').optional().isIn(['Active', 'Inactive']).withMessage('Status must be Active or Inactive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, phone, password, status = 'Active' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email, username, or phone number' 
      });
    }

    const user = new User({
      username,
      email,
      phone,
      password,
      status
    });

    await user.save();

    const userResponse = await User.findById(user._id)
      .select('-password -resetPasswordOTP -resetPasswordOTPExpire -resetPasswordAttempts');
    
    res.status(201).json({
      message: 'User created successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error while creating user' });
  }
});

// Update user
router.put('/:id', [
  auth,
  body('username').optional().isLength({ min: 3, max: 30 }).trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().matches(/^[6-9]\d{9}$/),
  body('password').optional().isLength({ min: 6 }),
  body('status').optional().isIn(['Active', 'Inactive'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, phone, password, status } = req.body;
    const updateData = {};

    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (password) updateData.password = password;
    if (status) updateData.status = status;

    // Check for duplicates if updating unique fields
    if (email || username || phone) {
      const query = {
        _id: { $ne: req.params.id },
        $or: []
      };
      
      if (email) query.$or.push({ email });
      if (username) query.$or.push({ username });
      if (phone) query.$or.push({ phone });

      if (query.$or.length > 0) {
        const existingUser = await User.findOne(query);
        if (existingUser) {
          return res.status(400).json({ 
            message: 'User already exists with this email, username, or phone number' 
          });
        }
      }
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password -resetPasswordOTP -resetPasswordOTPExpire -resetPasswordAttempts');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error while updating user' });
  }
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
  try {
    // Prevent deleting the current user
    if (req.params.id === req.user.userId) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
});

// Get single user
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -resetPasswordOTP -resetPasswordOTPExpire -resetPasswordAttempts');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
