const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
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
    caMarks: {
        type: Number,
        min: 0,
        max: 100
    },
    examMarks: {
        type: Number,
        min: 0,
        max: 100
    },
    totalMarks: {
        type: Number,
        min: 0,
        max: 100
    },
    grade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D', 'F']
    },
    gpa: {
        type: Number,
        min: 0,
        max: 4.0
    },
    semester: {
        type: String,
        required: true
    },
    academicYear: {
        type: String,
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    modifiedAt: Date,
    remarks: String
}, {
    timestamps: true
});

// Ensure one grade record per student per course per semester
gradeSchema.index({ student: 1, course: 1, semester: 1, academicYear: 1 }, { unique: true });

// Calculate total marks and GPA before saving
gradeSchema.pre('save', function (next) {
    if (this.caMarks !== undefined && this.examMarks !== undefined) {
        this.totalMarks = this.caMarks + this.examMarks;

        // Calculate grade and GPA based on total marks
        if (this.totalMarks >= 90) {
            this.grade = 'A+';
            this.gpa = 4.0;
        } else if (this.totalMarks >= 80) {
            this.grade = 'A';
            this.gpa = 3.7;
        } else if (this.totalMarks >= 75) {
            this.grade = 'B+';
            this.gpa = 3.3;
        } else if (this.totalMarks >= 70) {
            this.grade = 'B';
            this.gpa = 3.0;
        } else if (this.totalMarks >= 65) {
            this.grade = 'C+';
            this.gpa = 2.7;
        } else if (this.totalMarks >= 60) {
            this.grade = 'C';
            this.gpa = 2.3;
        } else if (this.totalMarks >= 55) {
            this.grade = 'D+';
            this.gpa = 2.0;
        } else if (this.totalMarks >= 50) {
            this.grade = 'D';
            this.gpa = 1.7;
        } else {
            this.grade = 'F';
            this.gpa = 0.0;
        }
    }
    next();
});

export default mongoose.model('Grade', gradeSchema);
