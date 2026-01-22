const mongoose = require('mongoose');

const feeStructureSchema = new mongoose.Schema({
    course: {
        type: String,
        required: [true, 'Course is required'],
        trim: true
    },
    branch: {
        type: String,
        required: [true, 'Branch is required'],
        trim: true
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required']
    },
    semesterFees: {
        semester1: { type: Number, required: true, min: 0 },
        semester2: { type: Number, required: true, min: 0 },
        semester3: { type: Number, required: true, min: 0 },
        semester4: { type: Number, required: true, min: 0 },
        semester5: { type: Number, required: true, min: 0 },
        semester6: { type: Number, required: true, min: 0 }
    },
    additionalFees: {
        registration: { type: Number, default: 0 },
        library: { type: Number, default: 0 },
        laboratory: { type: Number, default: 0 },
        sports: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound index for unique fee structure per course/branch/year
feeStructureSchema.index({ course: 1, branch: 1, academicYear: 1 }, { unique: true });

module.exports = mongoose.model('FeeStructure', feeStructureSchema);
