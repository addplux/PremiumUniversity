const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: [
            'assignment',
            'homework',
            'exam',
            'grade',
            'circular',
            'announcement',
            'fee',
            'attendance',
            'message',
            'system',
            'other'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    relatedEntity: {
        entityType: {
            type: String,
            enum: ['Assignment', 'Homework', 'Examination', 'Circular', 'Course', 'Payment', 'Other']
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId
        }
    },
    actionUrl: {
        type: String
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ priority: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
