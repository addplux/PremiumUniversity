const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    assignment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assignment',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String, // Can be text or a file path/link
        required: true
    },
    fileUrl: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'graded'],
        default: 'pending'
    },
    grade: {
        type: Number,
        min: 0
    },
    feedback: {
        type: String
    },
    submittedAt: {
        type: Date,
        default: Date.now
    },
    gradedAt: {
        type: Date
    },
    gradedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Prevent multiple submissions for the same assignment by the same student
submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export default mongoose.model('Submission', submissionSchema);
