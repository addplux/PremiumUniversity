const express = require('express');
const dotenv = require('dotenv');
// Load environment variables early
dotenv.config();

const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const mongoose = require('mongoose');
const path = require('path');

// Middleware imports
const { tenantMiddleware, optionalTenantMiddleware } = require('./middleware/tenantMiddleware');

// Route imports
const authRoutes = require('./routes/auth');
const organizationRoutes = require('./routes/organizations');
const applicationRoutes = require('./routes/applications');
const programRoutes = require('./routes/programs');
const contactRoutes = require('./routes/contact');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const enrollmentRoutes = require('./routes/enrollments');
const assignmentRoutes = require('./routes/assignments');
const financeRoutes = require('./routes/finance');
const paymentRoutes = require('./routes/payments');
const aiRoutes = require('./routes/ai');
const equityRoutes = require('./routes/equity');
const recommendationRoutes = require('./routes/recommendations');
const dashboardRoutes = require('./routes/dashboard');
const scheduleRoutes = require('./routes/schedules');
const eventRoutes = require('./routes/events');
const gradeRoutes = require('./routes/grades');
const onlineClassRoutes = require('./routes/onlineClasses');
const systemRoutes = require('./routes/system');
const teacherRoutes = require('./routes/teachers');
const lectureRoutes = require('./routes/lectures');
const examinationRoutes = require('./routes/examinations');
const feeStructureRoutes = require('./routes/feeStructures');
const studentFeeRoutes = require('./routes/studentFees');
const lessonPlanRoutes = require('./routes/lessonPlans');
const syllabiRoutes = require('./routes/syllabi');
const materialRoutes = require('./routes/materials');
const homeworkRoutes = require('./routes/homework');
const classworkRoutes = require('./routes/classwork');
const circularRoutes = require('./routes/circulars');
const notificationRoutes = require('./routes/notifications');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security Middleware
app.use(helmet()); // Sets various security-related HTTP headers
app.use(mongoSanitize()); // Data sanitization against NoSQL query injection
app.use(xss()); // Sanitize request body, query, and params for XSS

// Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: {
        success: false,
        message: 'Too many login attempts from this IP, please try again after 15 minutes'
    }
});

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost (Dev)
        if (origin.startsWith('http://localhost')) return callback(null, true);

        // Allow configured Frontend URL
        if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.replace(/\/$/, '')) {
            return callback(null, true);
        }

        // Allow any Railway or Vercel deployment (Auto-Allow for ease of use)
        if (origin.endsWith('.railway.app') || origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        console.log('Blocked by CORS:', origin);
        callback(null, true); // TEMPORARY: Allow all to debug
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database connection
let mongoKey = 'mongodb://localhost:27017/psohs';
let source = 'Default (Local)';

if (process.env.MONGODB_URI) {
    mongoKey = process.env.MONGODB_URI;
    source = 'process.env.MONGODB_URI';
} else if (process.env.MONGO_URL) {
    mongoKey = process.env.MONGO_URL;
    source = 'process.env.MONGO_URL';
}

// SANITIZATION: Remove any accidentally copied wrapping like ${{ }} or trailing braces
mongoKey = mongoKey.trim().replace(/^\${{/, '').replace(/}}$/, '');

// Mask URI for logging
const maskedURI = mongoKey.replace(/\/\/.*@/, '//****:****@');
console.log(`📡 DB Source: ${source}`);
console.log(`📡 Attempting to connect to MongoDB: ${maskedURI}`);

mongoose.connect(mongoKey, {
    serverSelectionTimeoutMS: 5000,
})
    .then(() => console.log('✅ MongoDB Connected Successfully'))
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('🛠️ Troubleshooting: Ensure your Railway variables are correct and not wrapped in ${{ }}.');
    });

app.use('/api/auth', authLimiter, optionalTenantMiddleware, authRoutes); // Apply rate limiter to auth routes
app.use('/api/programs', optionalTenantMiddleware, programRoutes);

// Multi-tenant routes (tenant context required)
app.use('/api/organizations', tenantMiddleware, organizationRoutes);
app.use('/api/applications', tenantMiddleware, applicationRoutes);
app.use('/api/contact', tenantMiddleware, contactRoutes);
app.use('/api/users', tenantMiddleware, userRoutes);
app.use('/api/courses', tenantMiddleware, courseRoutes);
app.use('/api/enrollments', tenantMiddleware, enrollmentRoutes);
app.use('/api/assignments', tenantMiddleware, assignmentRoutes);
app.use('/api/finance', tenantMiddleware, financeRoutes);
app.use('/api/payments', tenantMiddleware, paymentRoutes);
app.use('/api/ai', tenantMiddleware, aiRoutes);
app.use('/api/ai/equity', tenantMiddleware, equityRoutes);
app.use('/api/ai/content', tenantMiddleware, recommendationRoutes);
app.use('/api/dashboard', tenantMiddleware, dashboardRoutes);
app.use('/api/schedules', tenantMiddleware, scheduleRoutes);
app.use('/api/events', tenantMiddleware, eventRoutes);
app.use('/api/grades', tenantMiddleware, gradeRoutes);
app.use('/api/online-classes', tenantMiddleware, onlineClassRoutes);
app.use('/api/system', tenantMiddleware, systemRoutes);
app.use('/api/teachers', tenantMiddleware, teacherRoutes);
app.use('/api/lectures', tenantMiddleware, lectureRoutes);
app.use('/api/examinations', tenantMiddleware, examinationRoutes);
app.use('/api/fee-structures', tenantMiddleware, feeStructureRoutes);
app.use('/api/student-fees', tenantMiddleware, studentFeeRoutes);
app.use('/api/lesson-plans', tenantMiddleware, lessonPlanRoutes);
app.use('/api/syllabi', tenantMiddleware, syllabiRoutes);
app.use('/api/materials', tenantMiddleware, materialRoutes);
app.use('/api/homework', tenantMiddleware, homeworkRoutes);
app.use('/api/classwork', tenantMiddleware, classworkRoutes);
app.use('/api/circulars', tenantMiddleware, circularRoutes);
app.use('/api/notifications', tenantMiddleware, notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
        dbState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Something went wrong!',
        error: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
