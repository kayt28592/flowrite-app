/**
 * Authentication Service
 * Business logic for user authentication
 */

const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error.middleware');

/**
 * Register a new user
 * @param {object} userData - User data
 * @returns {Promise<User>}
 */
const registerUser = async (userData) => {
  const { name, email, password } = userData;

  // Validate input
  if (!name || !email || !password) {
    throw new ErrorResponse('Please provide name, email and password', 400);
  }

  if (password.length < 6) {
    throw new ErrorResponse('Password must be at least 6 characters', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new ErrorResponse('Email already registered', 400);
  }

  // Create user
  const user = await User.create({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  });

  return user;
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<User>}
 */
const loginUser = async (email, password) => {
  // Validate input
  if (!email || !password) {
    throw new ErrorResponse('Please provide email and password', 400);
  }

  // Find user and include password field
  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

  if (!user) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Check if user is active
  if (user.status !== 'Active') {
    throw new ErrorResponse('Your account has been deactivated. Please contact support.', 401);
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ErrorResponse('Invalid credentials', 401);
  }

  // Update last login atomically (prevents race condition)
  await User.findByIdAndUpdate(
    user._id,
    { lastLogin: new Date() },
    { new: false } // Don't need the updated document
  );

  // Update local user object for response
  user.lastLogin = new Date();

  return user;
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<User>}
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  return user;
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {object} updateData - Data to update
 * @returns {Promise<User>}
 */
const updateUserProfile = async (userId, updateData) => {
  // Whitelist allowed fields
  const allowedFields = ['name', 'email'];
  const filteredData = {};

  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  // Trim and sanitize
  if (filteredData.name) {
    filteredData.name = filteredData.name.trim();
  }
  if (filteredData.email) {
    filteredData.email = filteredData.email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({
      email: filteredData.email,
      _id: { $ne: userId }
    });

    if (existingUser) {
      throw new ErrorResponse('Email already in use', 400);
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    filteredData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  return user;
};

/**
 * Change password
 * @param {string} userId - User ID
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<User>}
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  // Validate input
  if (!currentPassword || !newPassword) {
    throw new ErrorResponse('Please provide current and new password', 400);
  }

  if (newPassword.length < 6) {
    throw new ErrorResponse('New password must be at least 6 characters', 400);
  }

  if (currentPassword === newPassword) {
    throw new ErrorResponse('New password must be different from current password', 400);
  }

  const user = await User.findById(userId).select('+password');

  if (!user) {
    throw new ErrorResponse('User not found', 404);
  }

  // Verify current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ErrorResponse('Current password is incorrect', 401);
  }

  // Update password (will be hashed by pre-save hook)
  user.password = newPassword;
  await user.save();

  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserById,
  updateUserProfile,
  changePassword,
};
