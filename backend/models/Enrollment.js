import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
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

// Prevent duplicate enrollment in the same course for the same semester (or indefinitely, depending on policy)
// Let's assume for now a student can only be 'enrolled' in a course once at a time.
enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.model('Enrollment', enrollmentSchema);
