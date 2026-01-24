const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add a course code'],
        uppercase: true,
        trim: true
        // Unique per organization, not globally
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    credits: {
        type: Number,
        default: 3
    },
    program: {
        type: String,
        required: true,
        enum: ['Registered Nursing', 'Clinical Medicine', 'Environmental Health Technologist', 'EN to RN Abridged', 'General']
    },
    semester: {
        type: String, // e.g., "Year 1 Semester 1"
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index: course code unique per organization
courseSchema.index({ organizationId: 1, code: 1 }, { unique: true });
courseSchema.index({ organizationId: 1, program: 1 });
courseSchema.index({ organizationId: 1, active: 1 });

module.exports = mongoose.model('Course', courseSchema);
