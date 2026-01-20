const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true
    },
    startTime: {
        type: String, // e.g., "09:00"
        required: true
    },
    endTime: {
        type: String, // e.g., "11:00"
        required: true
    },
    room: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Prevent room double-booking at the same time and day
scheduleSchema.index({ dayOfWeek: 1, startTime: 1, room: 1 }, { unique: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
