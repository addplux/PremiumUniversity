const mongoose = require('mongoose');

const circularSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    circularNumber: {
        type: String,
        unique: true,
        required: true
    },
    category: {
        type: String,
        enum: ['academic', 'administrative', 'event', 'holiday', 'exam', 'general', 'urgent'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    targetAudience: {
        type: String,
        enum: ['all', 'students', 'teachers', 'staff', 'parents', 'specific'],
        default: 'all'
    },
    specificRecipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    classes: [{
        type: String
    }],
    programs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    }],
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number
    }],
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuedDate: {
        type: Date,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    requiresAcknowledgment: {
        type: Boolean,
        default: false
    },
    acknowledgments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        acknowledgedAt: Date,
        comments: String
    }],
    readBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: Date
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
circularSchema.index({ circularNumber: 1 });
circularSchema.index({ issuedDate: -1 });
circularSchema.index({ targetAudience: 1, status: 1 });
circularSchema.index({ category: 1, priority: 1 });

module.exports = mongoose.model('Circular', circularSchema);
