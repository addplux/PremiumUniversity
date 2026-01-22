const mongoose = require('mongoose');

const lessonPlanSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    attachments: [{
        fileName: String,
        fileUrl: String,
        fileSize: Number
    }],
    lectureCode: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
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
lessonPlanSchema.index({ teacher: 1, startDate: 1 });
lessonPlanSchema.index({ programme: 1, semester: 1 });
lessonPlanSchema.index({ batch: 1, startDate: 1 });

module.exports = mongoose.model('LessonPlan', lessonPlanSchema);
