const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    organizationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        required: true,
        index: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    program: {
        type: String,
        required: [true, 'Program selection is required'],
        enum: ['Registered Nursing', 'Clinical Medicine', 'Environmental Health Technologist', 'EN to RN Abridged']
    },
    personalInfo: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        },
        dateOfBirth: {
            type: Date,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: true
        },
        nationality: {
            type: String,
            required: true,
            default: 'Zambian'
        },
        nrc: String,
        phone: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        address: {
            type: String,
            required: true
        },
        city: String,
        province: String
    },
    academicInfo: {
        grade12School: {
            type: String,
            required: true
        },
        grade12Year: {
            type: Number,
            required: true
        },
        subjects: [{
            name: String,
            grade: String
        }],
        hasRequiredGrades: {
            type: Boolean,
            default: false
        }
    },
    documents: {
        grade12Certificate: String,
        nrcCopy: String,
        passportPhoto: String,
        medicalCertificate: String,
        policeClearance: String
    },
    guardianInfo: {
        name: String,
        relationship: String,
        phone: String,
        email: String,
        address: String
    },
    status: {
        type: String,
        enum: ['pending', 'under_review', 'accepted', 'rejected', 'waitlisted'],
        default: 'pending'
    },
    statusHistory: [{
        status: String,
        date: {
            type: Date,
            default: Date.now
        },
        comment: String,
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    submittedAt: {
        type: Date,
        default: Date.now
    },
    reviewedAt: Date,
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    adminNotes: String
}, {
    timestamps: true
});

// Index for better query performance
applicationSchema.index({ organizationId: 1, user: 1, status: 1 });
applicationSchema.index({ organizationId: 1, program: 1, status: 1 });
applicationSchema.index({ organizationId: 1, status: 1 });

module.exports = mongoose.model('Application', applicationSchema);
