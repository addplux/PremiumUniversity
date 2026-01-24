const mongoose = require('mongoose');

const retentionDataSchema = new mongoose.Schema({
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

    // Academic Metrics (40% weight)
    academic: {
        gpa: { type: Number, default: 0 },
        attendanceRate: { type: Number, default: 0 }, // 0-100
        assignmentCompletionRate: { type: Number, default: 0 }, // 0-100
        failedCoursesCount: { type: Number, default: 0 },
        creditsEarned: { type: Number, default: 0 },
        creditsAttempted: { type: Number, default: 0 }
    },

    // Engagement Metrics (30% weight)
    engagement: {
        loginFrequency: { type: Number, default: 0 }, // logins/week
        lastLoginDate: Date,
        platformActivityScore: { type: Number, default: 0 }, // 0-100
        daysSinceLastActivity: { type: Number, default: 0 },
        forumParticipation: { type: Number, default: 0 }
    },

    // Financial Metrics (20% weight)
    financial: {
        tuitionPaidPercent: { type: Number, default: 0 }, // 0-100
        hasOutstandingBalance: { type: Boolean, default: false },
        daysOverdue: { type: Number, default: 0 },
        paymentHistoryScore: { type: Number, default: 100 } // 0-100
    },

    // Demographics/Static (10% weight)
    demographics: {
        distanceFromCampus: Number,
        isFirstGeneration: Boolean,
        employmentStatus: String, // 'unemployed', 'part-time', 'full-time'
        age: Number
    },

    // Prediction Result
    riskPrediction: {
        score: { type: Number, default: 0 }, // 0-100 (Higher is better retention, Lower is high risk)
        riskLevel: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            default: 'low'
        },
        riskFactors: [String],
        confidence: Number,
        predictedAt: Date
    },

    // Intervention History
    interventions: [{
        date: { type: Date, default: Date.now },
        type: {
            type: String,
            enum: ['automated_email', 'advisor_meeting', 'financial_counseling', 'academic_tutoring']
        },
        status: { type: String, enum: ['pending', 'completed', 'no_show'] },
        notes: String
    }]
}, {
    timestamps: true
});

// Compound index for efficient querying
retentionDataSchema.index({ organizationId: 1, 'riskPrediction.riskLevel': 1 });

// Method to calculate risk score (heuristic baseline before ML)
retentionDataSchema.methods.calculateBaselineRisk = function () {
    let score = 100;
    const factors = [];

    // 1. Academic Impact (Max -40)
    if (this.academic.gpa < 2.0) {
        score -= 20;
        factors.push('Low GPA');
    }
    if (this.academic.attendanceRate < 70) {
        score -= 15;
        factors.push('Low Attendance');
    }
    if (this.academic.failedCoursesCount > 0) {
        score -= (10 * this.academic.failedCoursesCount);
        factors.push('Course Failures');
    }

    // 2. Engagement Impact (Max -30)
    if (this.engagement.daysSinceLastActivity > 14) {
        score -= 20;
        factors.push('Inactive > 14 days');
    } else if (this.engagement.daysSinceLastActivity > 7) {
        score -= 10;
    }

    // 3. Financial Impact (Max -30)
    if (this.financial.hasOutstandingBalance && this.financial.daysOverdue > 30) {
        score -= 25;
        factors.push('Tuition Overdue');
    }

    // Clamp score 0-100
    this.riskPrediction.score = Math.max(0, Math.min(100, score));
    this.riskPrediction.riskFactors = factors;

    // Set Level (Inverse of retention score: Low Score = High Risk)
    if (score < 40) this.riskPrediction.riskLevel = 'critical';
    else if (score < 60) this.riskPrediction.riskLevel = 'high';
    else if (score < 80) this.riskPrediction.riskLevel = 'medium';
    else this.riskPrediction.riskLevel = 'low';

    this.riskPrediction.predictedAt = new Date();
};

module.exports = mongoose.model('RetentionData', retentionDataSchema);
