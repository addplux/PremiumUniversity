import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true
    },
    code: {
        type: String,
        required: [true, 'Please add a course code'],
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    credits: {
        type: Number,
        default: 3
    },
    program: {
        type: String,
        required: true,
        enum: ['Registered Nursing', 'Clinical Medicine', 'Environmental Health Technologist', 'EN to RN Abridged', 'General']
    },
    semester: {
        type: String, // e.g., "Year 1 Semester 1"
        required: true
    },
    instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('Course', courseSchema);
