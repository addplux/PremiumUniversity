const mongoose = require('mongoose');

const learningInteractionSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // What content was interacted with
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Material', // Assuming Material model exists
        required: true
    },
    contentType: {
        type: String,
        enum: ['video', 'document', 'quiz', 'assignment', 'external_link'],
        required: true
    },
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    topicTags: [String], // e.g., ['algebra', 'history', 'programming']

    // Interaction details
    interactionType: {
        type: String,
        enum: ['view', 'complete', 'like', 'share', 'bookmark', 'rate'],
        required: true
    },
    durationSeconds: { type: Number, default: 0 },
    rating: { type: Number, min: 1, max: 5 }, // If interactionType is 'rate'

    // Context
    deviceType: String, // 'mobile', 'desktop'
    networkType: String // '4g', '3g', 'wifi'
}, {
    timestamps: true
});

// Indexes for recommendation queries
learningInteractionSchema.index({ studentId: 1, topicTags: 1 });
learningInteractionSchema.index({ contentId: 1, interactionType: 1 });

module.exports = mongoose.model('LearningInteraction', learningInteractionSchema);
