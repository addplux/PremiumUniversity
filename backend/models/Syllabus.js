const mongoose = require('mongoose');

const syllabusSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    program: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Program'
    },
    title: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    semester: {
        type: String,
        enum: ['1', '2', '3', 'Full Year'],
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
        duration: Number, // in hours
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
syllabusSchema.index({ course: 1, academicYear: 1 });
syllabusSchema.index({ program: 1, academicYear: 1 });

module.exports = mongoose.model('Syllabus', syllabusSchema);
