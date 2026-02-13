/**
 * Authentication Controller
 * Handles HTTP requests for authentication
 */

const asyncHandler = require('express-async-handler');
const authService = require('../services/auth.service');
const { sendTokenResponse } = require('../utils/jwt.util');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);
  sendTokenResponse(user, 201, res);
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.loginUser(email, password);
  sendTokenResponse(user, 200, res);
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getUserById(req.user.id);
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateUserProfile(req.user.id, req.body);
  
  res.status(200).json({
    success: true,
    data: user,
  });
});

/**
 * @route   PUT /api/auth/password
 * @desc    Change password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await authService.changePassword(
    req.user.id,
    currentPassword,
    newPassword
  );
  
  sendTokenResponse(user, 200, res);
});

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
};
