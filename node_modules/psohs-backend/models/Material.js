const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['pdf', 'video', 'link', 'document', 'presentation', 'image', 'other'],
        required: true
    },
    periodicSemester: {
        type: String,
        required: true
    },
    programme: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program',
        required: true
    },
    semester: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: true
    },
    module: {
        type: String,
        required: true
    },
    faculty: {
        type: String,
        required: true
    },
    fileUrl: {
        type: String
    },
    externalLink: {
        type: String
    },
    fileSize: {
        type: Number
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessLevel: {
        type: String,
        enum: ['public', 'students', 'teachers', 'specific'],
        default: 'students'
    },
    allowedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    tags: [{
        type: String
    }],
    downloads: {
        type: Number,
        default: 0
    },
    views: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
materialSchema.index({ programme: 1, semester: 1 });
materialSchema.index({ batch: 1, isActive: 1 });
materialSchema.index({ uploadedBy: 1 });
materialSchema.index({ tags: 1 });

module.exports = mongoose.model('Material', materialSchema);
