const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes working' });
});

// Register route
router.post('/register', [
  body('username').isLength({ min: 3, max: 30 }).trim(),
  body('email').isEmail().normalizeEmail(),
  body('phone').matches(/^[6-9]\d{9}$/),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { username, email, phone, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email, username, or phone number' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      phone,
      password,
      status: 'Active'
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Login route with enhanced error handling
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email, timestamp: new Date() });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      console.log('Inactive user login attempt:', email);
      return res.status(401).json({ message: 'Account is inactive. Please contact administrator.' });
    }

    // Check password
    console.log('Checking password for user:', email);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id,
        email: user.email,
        isAdmin: user.isAdmin 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    console.log('Successful login:', email);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Create test user route (for development)
router.post('/create-test-user', async (req, res) => {
  try {
    // Delete existing test users
    await User.deleteMany({ 
      email: { 
        $in: [
          'admin@jagadalefarms.com', 
          'amoljagadale474@gmail.com'
        ] 
      } 
    });

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@jagadalefarms.com',
      phone: '9876543210',
      password: 'admin123',
      status: 'Active',
      isAdmin: true
    });

    await adminUser.save();

    // Create your custom user
    const customUser = new User({
      username: 'amoljagadale',
      email: 'amoljagadale474@gmail.com',
      phone: '9876543211',
      password: 'Amol@123',
      status: 'Active',
      isAdmin: true
    });

    await customUser.save();

    console.log('Test users created successfully');

    res.json({ 
      message: 'Test users created successfully',
      users: [
        {
          email: 'admin@jagadalefarms.com',
          password: 'admin123',
          role: 'Admin'
        },
        {
          email: 'amoljagadale474@gmail.com',
          password: 'Amol@123',
          role: 'Admin'
        }
      ]
    });
  } catch (error) {
    console.error('Create test user error:', error);
    res.status(500).json({ 
      message: 'Error creating test users',
      error: error.message 
    });
  }
});

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ 
      message: 'Token valid',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        status: user.status,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
