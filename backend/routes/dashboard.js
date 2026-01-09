import express from 'express';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Assignment from '../models/Assignment.js';
import Submission from '../models/Submission.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Helper for GPA calculation (same logic as in enrollments.js)
const getGradePoints = (grade) => {
    const weights = {
        'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    return weights[grade] || 0;
};

// @route   GET /api/dashboard/admin
// @desc    Get aggregated stats for Admin Dashboard
// @access  Private/Admin
router.get('/admin', protect, admin, async (req, res) => {
    try {
        const [
            appStats,
            studentCount,
            facultyCount,
            courseCount,
            revenueStats,
            recentApps,
            recentPayments
        ] = await Promise.all([
            // Application Stats
            Application.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
                        accepted: { $sum: { $cond: [{ $eq: ["$status", "accepted"] }, 1, 0] } }
                    }
                }
            ]),
            // User Counts
            User.countDocuments({ role: 'student' }),
            User.countDocuments({ role: 'faculty' }),
            // Course Count
            Course.countDocuments(),
            // Revenue Stats
            Payment.aggregate([
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$amount" }
                    }
                }
            ]),
            // Recent Activity
            Application.find().sort({ submittedAt: -1 }).limit(5).select('personalInfo program status submittedAt'),
            Payment.find().sort({ date: -1 }).limit(5).populate('student', 'firstName lastName').select('amount student date')
        ]);

        res.json({
            success: true,
            data: {
                applications: appStats[0] || { total: 0, pending: 0, accepted: 0 },
                users: {
                    students: studentCount,
                    faculty: facultyCount
                },
                academics: {
                    courses: courseCount
                },
                finance: {
                    totalRevenue: revenueStats[0]?.totalRevenue || 0
                },
                recentActivity: {
                    applications: recentApps,
                    payments: recentPayments
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch admin dashboard stats' });
    }
});

// @route   GET /api/dashboard/student
// @desc    Get aggregated stats for Student Dashboard
// @access  Private
router.get('/student', protect, async (req, res) => {
    try {
        const studentId = req.user._id;

        const [
            enrollments,
            assignments,
            submissions,
            payments
        ] = await Promise.all([
            Enrollment.find({ student: studentId }).populate('course', 'title code credits'),
            // Assignments for enrolled courses
            Assignment.find({ course: { $in: await Enrollment.find({ student: studentId }).distinct('course') } }),
            Submission.find({ student: studentId }),
            Payment.find({ student: studentId }).sort({ date: -1 }).limit(1)
        ]);

        // GPA and Credits Calculation
        let totalPoints = 0;
        let totalCredits = 0;
        let completedCourses = 0;

        enrollments.forEach(enr => {
            if (enr.status === 'completed' && enr.grade) {
                const points = getGradePoints(enr.grade);
                const credits = enr.course?.credits || 0;
                totalPoints += (points * credits);
                totalCredits += credits;
                completedCourses++;
            }
        });

        const gpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

        // Assignment summary
        const submissionMap = new Set(submissions.map(s => s.assignment.toString()));
        const pendingAssignments = assignments.filter(asm => !submissionMap.has(asm._id.toString()));

        res.json({
            success: true,
            data: {
                academics: {
                    enrolledCourses: enrollments.length,
                    completedCourses,
                    totalCredits,
                    gpa
                },
                assignments: {
                    total: assignments.length,
                    pending: pendingAssignments.length,
                    upcoming: pendingAssignments.slice(0, 3) // Top 3 upcoming
                },
                finance: {
                    lastPayment: payments[0] || null
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to fetch student dashboard stats' });
    }
});

export default router;
