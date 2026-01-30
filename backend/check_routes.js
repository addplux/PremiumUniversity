const fs = require('fs');
const path = require('path');

const routes = {
    authRoutes: './routes/auth',
    organizationRoutes: './routes/organizations',
    applicationRoutes: './routes/applications',
    programRoutes: './routes/programs',
    contactRoutes: './routes/contact',
    userRoutes: './routes/users',
    courseRoutes: './routes/courses',
    enrollmentRoutes: './routes/enrollments',
    assignmentRoutes: './routes/assignments',
    financeRoutes: './routes/finance',
    paymentRoutes: './routes/payments',
    aiRoutes: './routes/ai',
    equityRoutes: './routes/equity',
    recommendationRoutes: './routes/recommendations',
    dashboardRoutes: './routes/dashboard',
    scheduleRoutes: './routes/schedules',
    eventRoutes: './routes/events',
    gradeRoutes: './routes/grades',
    onlineClassRoutes: './routes/onlineClasses',
    systemRoutes: './routes/system',
    teacherRoutes: './routes/teachers',
    lectureRoutes: './routes/lectures',
    examinationRoutes: './routes/examinations',
    feeStructureRoutes: './routes/feeStructures',
    studentFeeRoutes: './routes/studentFees',
    lessonPlanRoutes: './routes/lessonPlans',
    syllabiRoutes: './routes/syllabi',
    materialRoutes: './routes/materials',
    homeworkRoutes: './routes/homework',
    classworkRoutes: './routes/classwork',
    circularRoutes: './routes/circulars',
    notificationRoutes: './routes/notifications'
};

console.log('Verifying route exports...\n');

for (const [name, p] of Object.entries(routes)) {
    try {
        const route = require(p);
        console.log(`${name.padEnd(25)}: ${typeof route === 'function' ? '✅' : '❌ (' + typeof route + ')'}`);
        if (typeof route !== 'function') {
            console.error(`  - ERROR: ${name} exported a ${typeof route} instead of a Router function.`);
        }
    } catch (e) {
        console.log(`${name.padEnd(25)}: 💣 (ERROR)`);
        console.error(`  - FAILED to require: ${e.message}`);
    }
}
