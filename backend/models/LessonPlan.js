const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    subject: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    period: {
        type: String
    },
    duration: {
        type: Number, // in minutes
        required: true
    },
    objectives: [{
        type: String
    }],
    learningOutcomes: [{
        type: String
    }],
    teachingMethodology: {
        type: String
    },
    resources: [{
        type: String
    }],
    activities: [{
        activity: String,
        duration: Number,
        description: String
    }],
    assessment: {
        type: String
    },
    homework: {
        type: String
    },
    notes: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for efficient queries
lessonPlanSchema.index({ teacher: 1, date: 1 });
lessonPlanSchema.index({ course: 1, date: 1 });
lessonPlanSchema.index({ class: 1, date: 1 });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);
