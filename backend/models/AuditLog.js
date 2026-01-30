const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String, // e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN'
        required: true
    },
    resource: {
        type: String, // e.g., 'Grade', 'Payment', 'User'
        required: true
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId
    },
    metadata: {
        previousState: mongoose.Schema.Types.Mixed,
        newState: mongoose.Schema.Types.Mixed,
        ipAddress: String,
        userAgent: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);
