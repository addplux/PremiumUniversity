const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
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
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    assignedDate: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    totalPoints: {
        type: Number,
        default: 100
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number
    }],
    instructions: {
        type: String
    },
    submissions: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        submittedAt: Date,
        files: [{
            fileName: String,
            fileUrl: String
        }],
        comments: String,
        grade: Number,
        feedback: String,
        gradedAt: Date,
        status: {
            type: String,
            enum: ['submitted', 'graded', 'late', 'missing'],
            default: 'submitted'
        }
    }],
    status: {
        type: String,
        enum: ['draft', 'published', 'closed'],
        default: 'draft'
    },
    allowLateSubmission: {
        type: Boolean,
        default: true
    },
    lateSubmissionPenalty: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for efficient queries
homeworkSchema.index({ teacher: 1, assignedDate: -1 });
homeworkSchema.index({ programme: 1, semester: 1 });
homeworkSchema.index({ batch: 1, dueDate: 1 });

module.exports = mongoose.model('Homework', homeworkSchema);
