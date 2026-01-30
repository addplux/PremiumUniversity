const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    maxPoints: {
        type: Number,
        required: true,
        default: 100
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

assignmentSchema.index({ organizationId: 1, course: 1 });
assignmentSchema.index({ organizationId: 1, createdBy: 1 });

module.exports = mongoose.model('Assignment', assignmentSchema);
