const express = require('express');
const User = require('../models/User.js');
const AuditLog = require('../models/AuditLog.js');
const { protect, systemAdmin } = require('../middleware/auth.js');
const { createAuditLog } = require('../utils/auditLogger.js');

const router = express.Router();

// @route   GET /api/system/health
// @desc    Get system health metrics (System Admin only)
// @access  Private/System Admin
router.get('/health', protect, systemAdmin, async (req, res) => {
    try {
        const dbStatus = await checkDatabaseConnection();
        const userStats = await User.countDocuments();
        const auditLogCount = await AuditLog.countDocuments();

        res.json({
            success: true,
            data: {
                status: 'healthy',
                database: dbStatus,
                timestamp: new Date(),
                stats: {
                    totalUsers: userStats,
                    totalAuditLogs: auditLogCount,
                    uptime: process.uptime(),
                    memory: process.memoryUsage()
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'System health check failed',
            data: { status: 'unhealthy' }
        });
    }
});

// @route   GET /api/system/audit-logs
// @desc    Get audit logs (System Admin only)
// @access  Private/System Admin
router.get('/audit-logs', protect, systemAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 100, resource, action } = req.query;

        const query = {};
        if (resource) query.resource = resource;
        if (action) query.action = action;

        const logs = await AuditLog.find(query)
            .populate('userId', 'firstName lastName email role')
            .sort({ timestamp: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await AuditLog.countDocuments(query);

        res.json({
            success: true,
            count: logs.length,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit)),
            data: logs
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch audit logs' });
    }
});

// @route   GET /api/system/stats
// @desc    Get database statistics (System Admin only)
// @access  Private/System Admin
router.get('/stats', protect, systemAdmin, async (req, res) => {
    try {
        const usersByRole = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);

        const recentLogins = await AuditLog.countDocuments({
            action: 'login',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        const failedLogins = await AuditLog.countDocuments({
            action: 'failed_login',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        res.json({
            success: true,
            data: {
                usersByRole,
                recentLogins,
                failedLogins,
                timestamp: new Date()
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch statistics' });
    }
});

// @route   GET /api/system/security
// @desc    Get security monitoring data (System Admin only)
// @access  Private/System Admin
router.get('/security', protect, systemAdmin, async (req, res) => {
    try {
        // Get failed login attempts in last 24 hours
        const failedLogins = await AuditLog.find({
            action: 'failed_login',
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        })
            .populate('user', 'email')
            .sort({ createdAt: -1 })
            .limit(20);

        // Get recent role changes
        const roleChanges = await AuditLog.find({
            action: 'role_changed',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(10);

        // Get recent user deletions
        const userDeletions = await AuditLog.find({
            action: 'user_deleted',
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
            .populate('user', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            data: {
                failedLogins,
                roleChanges,
                userDeletions
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch security data' });
    }
});

// Helper function to check database connection
async function checkDatabaseConnection() {
    try {
        await User.findOne().limit(1);
        return 'connected';
    } catch (error) {
        return 'disconnected';
    }
}

module.exports = router;
