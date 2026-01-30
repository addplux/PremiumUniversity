const AuditLog = require('../models/AuditLog');

/**
 * Middleware to record audit logs for mutating requests
 * @param {string} resourceName - Name of the resource being acted upon
 */
const auditLogMiddleware = (resourceName) => {
    return async (req, res, next) => {
        // Capture the original send to track response success
        const originalSend = res.send;

        res.send = function (data) {
            // Only log successful mutations (POST, PUT, DELETE)
            if (res.statusCode >= 200 && res.statusCode < 300 && ['POST', 'PUT', 'DELETE'].includes(req.method)) {

                const logEntry = {
                    organizationId: req.organizationId,
                    userId: req.user ? req.user.id : null,
                    action: req.method === 'POST' ? 'CREATE' : (req.method === 'PUT' ? 'UPDATE' : 'DELETE'),
                    resource: resourceName,
                    resourceId: req.params.id || null,
                    metadata: {
                        ipAddress: req.ip,
                        userAgent: req.get('User-Agent'),
                        // We avoid logging full state here for performance, but could be added specifically
                        query: req.query,
                        body: req.method !== 'GET' ? { ...req.body } : undefined
                    }
                };

                // Remove sensitive fields from logs
                if (logEntry.metadata.body) {
                    delete logEntry.metadata.body.password;
                    delete logEntry.metadata.body.token;
                }

                // Fire and forget logging (don't block the response)
                AuditLog.create(logEntry).catch(err => console.error('Audit Log Error:', err));
            }

            return originalSend.apply(res, arguments);
        };

        next();
    };
};

module.exports = auditLogMiddleware;
