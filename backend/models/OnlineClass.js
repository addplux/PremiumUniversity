const mongoose = require('mongoose');

const onlineClassSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: String,
    meetingLink: {
        type: String,
        required: true
    },
    platform: {
        type: String,
        enum: ['Zoom', 'Google Meet', 'Microsoft Teams', 'Other'],
        default: 'Zoom'
    },
    scheduledDate: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // in minutes
        required: true,
        default: 60
    },
    status: {
        type: String,
        enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    recordingUrl: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    modifiedAt: Date,
    attendees: [{
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: Date,
        leftAt: Date,
        duration: Number // in minutes
    }]
}, {
    timestamps: true
});

// Index for efficient querying
onlineClassSchema.index({ course: 1, scheduledDate: -1 });
onlineClassSchema.index({ status: 1, scheduledDate: 1 });

export default mongoose.model('OnlineClass', onlineClassSchema);
