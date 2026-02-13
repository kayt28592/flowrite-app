/**
 * User Controller
 * Manage user accounts, roles, and permissions
 */

const User = require('../models/User');
const { ErrorResponse } = require('../middleware/error.middleware');

/**
 * @desc    Get all users
 * @route   GET /api/users
 * @access  Private/Admin
 */
exports.getUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 10;
        const startIndex = (page - 1) * limit;
        const keyword = req.query.keyword;
        const role = req.query.role;
        const status = req.query.status;

        let query = { deletedAt: null };

        // Search by name or email
        if (keyword) {
            query.$or = [
                { name: { $regex: keyword, $options: 'i' } },
                { email: { $regex: keyword, $options: 'i' } }
            ];
        }

        // Filter by role
        if (role) {
            query.role = role;
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        const total = await User.countDocuments(query);

        const users = await User.find(query)
            .skip(startIndex)
            .limit(limit)
            .sort({ createdAt: -1 });

        const pagination = {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        };

        res.status(200).json({
            success: true,
            count: users.length,
            pagination,
            data: users.map(user => user.getPublicProfile()),
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Create new user
 * @route   POST /api/users
 * @access  Private/Admin
 */
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role, permissions, status } = req.body;

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'Staff',
            permissions: permissions || {},
            status: status || 'Active',
        });

        res.status(201).json({
            success: true,
            data: user.getPublicProfile(),
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new ErrorResponse('Email already exists', 400));
        }
        next(error);
    }
};

/**
 * @desc    Update user
 * @route   PUT /api/users/:id
 * @access  Private/Admin
 */
exports.updateUser = async (req, res, next) => {
    try {
        const { name, email, role, permissions, status, password } = req.body;

        // Find user to update
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        // Update fields
        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (permissions) user.permissions = permissions;
        if (status) user.status = status;

        // Update password if provided
        if (password) {
            user.password = password;
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: user.getPublicProfile(),
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new ErrorResponse('Email already exists', 400));
        }
        next(error);
    }
};

/**
 * @desc    Delete user (Soft delete)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        // Prevent deleting self
        if (user._id.toString() === req.user._id.toString()) {
            return next(new ErrorResponse('You cannot delete your own account', 400));
        }

        user.deletedAt = new Date();
        user.status = 'Inactive'; // Also mark as inactive
        await user.save();

        res.status(200).json({
            success: true,
            data: {},
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user status
 * @route   PATCH /api/users/:id/status
 * @access  Private/Admin
 */
exports.updateUserStatus = async (req, res, next) => {
    try {
        const { status } = req.body;

        if (!['Active', 'Inactive'].includes(status)) {
            return next(new ErrorResponse('Invalid status. Must be Active or Inactive', 400));
        }

        const user = await User.findById(req.params.id);

        if (!user) {
            return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
        }

        // Prevent deactivating self
        if (user._id.toString() === req.user._id.toString() && status === 'Inactive') {
            return next(new ErrorResponse('You cannot deactivate your own account', 400));
        }

        user.status = status;
        await user.save();

        res.status(200).json({
            success: true,
            data: user.getPublicProfile()
        });
    } catch (error) {
        next(error);
    }
};
