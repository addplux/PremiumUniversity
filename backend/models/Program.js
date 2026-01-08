import mongoose from 'mongoose';

const programSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    shortName: String,
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    level: {
        type: String,
        enum: ['Diploma', 'Certificate', 'Degree'],
        default: 'Diploma'
    },
    entryRequirements: {
        minimumGrade12Credits: {
            type: Number,
            default: 5
        },
        requiredSubjects: [String],
        specificRequirements: [String],
        additionalInfo: String
    },
    curriculum: [{
        year: Number,
        courses: [String]
    }],
    careerProspects: [String],
    tuitionFee: {
        amount: Number,
        currency: {
            type: String,
            default: 'ZMW'
        },
        period: {
            type: String,
            default: 'per year'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    intakeMonths: [{
        type: String,
        enum: ['January ', 'April', 'July', 'September']
    }],
    capacity: Number,
    currentEnrollment: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Program', programSchema);
