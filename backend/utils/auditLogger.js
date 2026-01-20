const AuditLog = require('../models/AuditLog.js');

/**
 * Create an audit log entry
 * @param {Object} params - Audit log parameters
 * @param {String} params.userId - ID of the user performing the action
 * @param {String} params.action - Action being performed
 * @param {String} params.targetModel - Model being affected
 * @param {String} params.targetId - ID of the affected document
 * @param {Object} params.details - Additional details about the action
 * @param {Object} params.req - Express request object (optional, for IP and user agent)
 */
export const createAuditLog = async ({ userId, action, targetModel, targetId, details, req }) => {
    try {
        const logData = {
            user: userId,
            action,
            targetModel,
            targetId,
            details
        };

        if (req) {
            logData.ipAddress = req.ip || req.connection.remoteAddress;
            logData.userAgent = req.get('user-agent');
        }

        await AuditLog.create(logData);
    } catch (error) {
        console.error('Failed to create audit log:', error);
        // Don't throw error - audit logging failure shouldn't break the main operation
    }
};

/**
 * Middleware to automatically log admin actions
 */
export const auditMiddleware = (action, targetModel) => {
    return async (req, res, next) => {
        // Store original json method
        const originalJson = res.json.bind(res);

        // Override json method to capture response
        res.json = function (data) {
            // Only log successful operations (2xx status codes)
            if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
                const targetId = data?.data?._id || req.params?.id;

                createAuditLog({
                    userId: req.user._id,
                    action,
                    targetModel,
                    targetId,
                    details: {
                        method: req.method,
                        path: req.path,
                        body: req.body
                    },
                    req
                });
            }

            // Call original json method
            return originalJson(data);
        };

        next();
    };
};

module.exports = { createAuditLog, auditMiddleware };
