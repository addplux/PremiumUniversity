const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized, user not found'
                });
            }

            next();
        } catch (error) {
            console.error(error);
            return res.status(401).json({
                success: false,
                message: 'Not authorized, token failed'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        });
    }
};

exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized as admin'
        });
    }
};

// Finance Admin middleware
exports.financeAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'finance_admin' || req.user.role === 'system_admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized - Finance Admin access required'
        });
    }
};

// System Admin middleware
exports.systemAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'system_admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized - System Admin access required'
        });
    }
};

// Academic Admin middleware
exports.academicAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'academic_admin' || req.user.role === 'system_admin')) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized - Academic Admin access required'
        });
    }
};

// Any Admin middleware (for shared resources)
exports.anyAdmin = (req, res, next) => {
    if (req.user && ['admin', 'finance_admin', 'system_admin', 'academic_admin'].includes(req.user.role)) {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized - Admin access required'
        });
    }
};
// Super Admin (Global) middleware
exports.superAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('+isSuperAdmin');
        if (user && user.isSuperAdmin) {
            next();
        } else {
            res.status(403).json({
                success: false,
                message: 'Access denied. Global Super Admin privileges required.'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Generic role authorization middleware
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }
        if (!roles.includes(req.user.role) && req.user.role !== 'system_admin' && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
