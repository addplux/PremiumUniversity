const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    title: {
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
    description: {
        type: String
    },
    objectives: [{
        type: String
    }],
    learningOutcomes: [{
        type: String
    }],
    topics: [{
        title: String,
        description: String,
        weekNumber: Number,
        duration: Number,
        subtopics: [String]
    }],
    assessmentMethods: [{
        type: String,
        weightage: Number
    }],
    textbooks: [{
        title: String,
        author: String,
        isbn: String,
        type: { type: String, enum: ['required', 'recommended'] }
    }],
    references: [{
        type: String
    }],
    prerequisites: [{
        type: String
    }],
    fileUrl: {
        type: String
    },
    version: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'published', 'archived'],
        default: 'draft'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    publishedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
syllabusSchema.index({ programme: 1, semester: 1 });
syllabusSchema.index({ batch: 1, periodicSemester: 1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);
