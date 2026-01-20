const mongoose = require('mongoose');

const classworkSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    duration: {
        type: Number // in minutes
    },
    activityType: {
        type: String,
        enum: ['quiz', 'discussion', 'exercise', 'presentation', 'lab', 'project', 'other'],
        default: 'exercise'
    },
    instructions: {
        type: String
    },
    materials: [{
        fileName: String,
        fileUrl: String
    }],
    totalPoints: {
        type: Number,
        default: 10
    },
    participation: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            enum: ['present', 'absent', 'completed', 'incomplete'],
            default: 'present'
        },
        score: Number,
        notes: String,
        submittedWork: String
    }],
    status: {
        type: String,
        enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient queries
classworkSchema.index({ teacher: 1, date: -1 });
classworkSchema.index({ class: 1, date: -1 });
classworkSchema.index({ course: 1 });

module.exports = mongoose.model('Classwork', classworkSchema);
