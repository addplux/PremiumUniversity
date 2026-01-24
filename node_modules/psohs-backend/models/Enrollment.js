const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    semester: {
        type: String,
        required: true // Snapshot of when they took it
    },
    status: {
        type: String,
        enum: ['enrolled', 'completed', 'dropped', 'failed'],
        default: 'enrolled'
    },
    grade: {
        type: String, // A, B+, etc.
        default: null
    },
    enrolledAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date
}, {
    timestamps: true
});

// Prevent duplicate enrollment in the same course for the same semester
// Student can only be 'enrolled' in a course once at a time per organization
enrollmentSchema.index({ organizationId: 1, student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ organizationId: 1, student: 1 });
enrollmentSchema.index({ organizationId: 1, course: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
