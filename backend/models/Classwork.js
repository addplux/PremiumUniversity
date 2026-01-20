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
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    duration: {
        type: Number
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
classworkSchema.index({ programme: 1, semester: 1 });
classworkSchema.index({ batch: 1, date: -1 });

module.exports = mongoose.model('Classwork', classworkSchema);
