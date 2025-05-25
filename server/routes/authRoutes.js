const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

// Middleware to verify token
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Verify token endpoint
router.get('/verify', verifyToken, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone,
        role: req.user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'user',
      verificationCode,
      verificationCodeExpires
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, name, verificationCode);

    res.status(201).json({
      success: true,
      message: 'Please check your email for verification code',
      userId: user._id
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Verify email
router.post('/verify-email', async (req, res) => {
  try {
    const { userId, code } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: 'Invalid verification code' });
    }

    if (user.verificationCodeExpires < new Date()) {
      return res.status(400).json({ message: 'Verification code has expired' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Resend verification code
router.post('/resend-verification', async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    // Generate new verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();

    // Send new verification email
    await sendVerificationEmail(user.email, user.name, verificationCode);

    res.json({
      success: true,
      message: 'New verification code sent'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Disable (soft delete) user account
router.post('/disable-account', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.is_active = false;
    await user.save();
    res.json({ success: true, message: 'Account disabled' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Reactivate user account
router.post('/reactivate-account', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.is_active) {
      return res.status(400).json({ message: 'Account is already active' });
    }
    user.is_active = true;
    await user.save();
    res.json({ success: true, message: 'Account reactivated' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Regular user login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    // Prevent admin login through regular login route
    if (!user || user.role === 'admin') {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.is_active === false) {
      return res.status(403).json({
        message: "You've already had an account. Would you like to reactivate it?",
        can_reactivate: true
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin login route
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    // Only allow admin login
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid admin credentials' 
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email }, 
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error' 
    });
  }
});

// Create initial admin account
router.post('/create-admin', async (req, res) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin account already exists' });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin',
      email: 'admin@eyewear.com',
      password: hashedPassword,
      phone: '1234567890',
      role: 'admin'
    });

    await admin.save();
    res.status(201).json({ message: 'Admin account created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot password route
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user doesn't exist to prevent email enumeration
      return res.json({ 
        success: true, 
        message: 'If an account exists with this email, you will receive password reset instructions.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name, resetToken);

    res.json({ 
      success: true, 
      message: 'If an account exists with this email, you will receive password reset instructions.' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password route
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ success: true, message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password route
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile (name and phone)
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name && !phone) {
      return res.status(400).json({ message: 'Name or phone is required' });
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 