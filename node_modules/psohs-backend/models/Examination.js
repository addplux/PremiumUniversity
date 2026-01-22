const mongoose = require('mongoose');

const examinationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Student is required']
    },
    semester: {
        type: String,
        required: [true, 'Semester is required'],
        trim: true
    },
    academicYear: {
        type: String,
        required: [true, 'Academic year is required'],
        trim: true
    },
    courses: [{
        course: {
            type: String,
            required: true
        },
        marks: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        grade: {
            type: String,
            enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F']
        }
    }],
    gpa: {
        type: Number,
        min: 0,
        max: 4.0
    },
    cgpa: {
        type: Number,
        min: 0,
        max: 4.0
    }
}, {
    timestamps: true
});

// Calculate grade from marks
examinationSchema.methods.calculateGrade = function (marks) {
    if (marks >= 95) return 'A+';
    if (marks >= 90) return 'A';
    if (marks >= 85) return 'A-';
    if (marks >= 80) return 'B+';
    if (marks >= 75) return 'B';
    if (marks >= 70) return 'B-';
    if (marks >= 65) return 'C+';
    if (marks >= 60) return 'C';
    if (marks >= 55) return 'C-';
    if (marks >= 50) return 'D';
    return 'F';
};

// Calculate GPA from grades
examinationSchema.methods.calculateGPA = function () {
    const gradePoints = {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D': 1.0, 'F': 0.0
    };

    if (this.courses.length === 0) return 0;

    const totalPoints = this.courses.reduce((sum, course) => {
        return sum + (gradePoints[course.grade] || 0);
    }, 0);

    return (totalPoints / this.courses.length).toFixed(2);
};

// Auto-calculate grades and GPA before saving
examinationSchema.pre('save', function (next) {
    // Calculate grade for each course
    this.courses.forEach(course => {
        if (!course.grade) {
            course.grade = this.calculateGrade(course.marks);
        }
    });

    // Calculate GPA
    this.gpa = this.calculateGPA();

    next();
});

module.exports = mongoose.model('Examination', examinationSchema);
