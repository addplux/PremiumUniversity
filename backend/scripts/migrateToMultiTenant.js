/**
 * Migration Script: Add organizationId to all existing models
 * Run this once to update existing data for multi-tenancy support
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Application = require('../models/Application');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Grade = require('../models/Grade');
const Payment = require('../models/Payment');
const StudentFee = require('../models/StudentFee');
const Assignment = require('../models/Assignment');
const Examination = require('../models/Examination');
const Contact = require('../models/Contact');
const Organization = require('../models/Organization');

async function migrateToMultiTenant() {
    try {
        console.log('🚀 Starting multi-tenant migration...\n');

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Step 1: Create default organization if it doesn't exist
        let defaultOrg = await Organization.findOne({ slug: 'default' });

        if (!defaultOrg) {
            console.log('📝 Creating default organization...');
            defaultOrg = await Organization.create({
                name: 'Premium School of Health Sciences',
                slug: 'default',
                subdomain: 'app',
                contact: {
                    adminEmail: 'admin@psohs.ac.zm',
                    adminPhone: '+260123456789',
                    address: 'Lusaka, Zambia',
                    country: 'Zambia'
                },
                subscription: {
                    plan: 'enterprise',
                    status: 'active'
                },
                limits: {
                    maxStudents: 10000,
                    maxStaff: 500,
                    maxCourses: 1000,
                    maxStorageGB: 100
                },
                features: {
                    sso: true,
                    customDomain: true,
                    apiAccess: true,
                    whiteLabel: true,
                    advancedReporting: true,
                    mobileApp: true,
                    bulkImport: true,
                    webhooks: true
                },
                isActive: true
            });
            console.log(`✅ Created default organization: ${defaultOrg.name} (${defaultOrg.slug})\n`);
        } else {
            console.log(`✅ Default organization already exists: ${defaultOrg.name}\n`);
        }

        // Step 2: Update all users without organizationId
        const usersWithoutOrg = await User.countDocuments({ organizationId: { $exists: false } });
        if (usersWithoutOrg > 0) {
            console.log(`📝 Updating ${usersWithoutOrg} users with default organization...`);
            await User.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${usersWithoutOrg} users\n`);
        } else {
            console.log('✅ All users already have organizationId\n');
        }

        // Step 3: Update all applications
        const appsWithoutOrg = await Application.countDocuments({ organizationId: { $exists: false } });
        if (appsWithoutOrg > 0) {
            console.log(`📝 Updating ${appsWithoutOrg} applications...`);
            await Application.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${appsWithoutOrg} applications\n`);
        }

        // Step 4: Update all courses
        const coursesWithoutOrg = await Course.countDocuments({ organizationId: { $exists: false } });
        if (coursesWithoutOrg > 0) {
            console.log(`📝 Updating ${coursesWithoutOrg} courses...`);
            await Course.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${coursesWithoutOrg} courses\n`);
        }

        // Step 5: Update all enrollments
        const enrollmentsWithoutOrg = await Enrollment.countDocuments({ organizationId: { $exists: false } });
        if (enrollmentsWithoutOrg > 0) {
            console.log(`📝 Updating ${enrollmentsWithoutOrg} enrollments...`);
            await Enrollment.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${enrollmentsWithoutOrg} enrollments\n`);
        }

        // Step 6: Update all grades
        const gradesWithoutOrg = await Grade.countDocuments({ organizationId: { $exists: false } });
        if (gradesWithoutOrg > 0) {
            console.log(`📝 Updating ${gradesWithoutOrg} grades...`);
            await Grade.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${gradesWithoutOrg} grades\n`);
        }

        // Step 7: Update all payments
        const paymentsWithoutOrg = await Payment.countDocuments({ organizationId: { $exists: false } });
        if (paymentsWithoutOrg > 0) {
            console.log(`📝 Updating ${paymentsWithoutOrg} payments...`);
            await Payment.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${paymentsWithoutOrg} payments\n`);
        }

        // Step 8: Update all student fees
        const feesWithoutOrg = await StudentFee.countDocuments({ organizationId: { $exists: false } });
        if (feesWithoutOrg > 0) {
            console.log(`📝 Updating ${feesWithoutOrg} student fees...`);
            await StudentFee.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${feesWithoutOrg} student fees\n`);
        }

        // Step 9: Update all assignments
        const assignmentsWithoutOrg = await Assignment.countDocuments({ organizationId: { $exists: false } });
        if (assignmentsWithoutOrg > 0) {
            console.log(`📝 Updating ${assignmentsWithoutOrg} assignments...`);
            await Assignment.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${assignmentsWithoutOrg} assignments\n`);
        }

        // Step 10: Update all examinations
        const examsWithoutOrg = await Examination.countDocuments({ organizationId: { $exists: false } });
        if (examsWithoutOrg > 0) {
            console.log(`📝 Updating ${examsWithoutOrg} examinations...`);
            await Examination.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${examsWithoutOrg} examinations\n`);
        }

        // Step 11: Update all contact messages
        const contactsWithoutOrg = await Contact.countDocuments({ organizationId: { $exists: false } });
        if (contactsWithoutOrg > 0) {
            console.log(`📝 Updating ${contactsWithoutOrg} contact messages...`);
            await Contact.updateMany(
                { organizationId: { $exists: false } },
                { $set: { organizationId: defaultOrg._id } }
            );
            console.log(`✅ Updated ${contactsWithoutOrg} contact messages\n`);
        }

        // Step 12: Update organization usage statistics
        console.log('📊 Calculating organization usage statistics...');
        const studentCount = await User.countDocuments({
            organizationId: defaultOrg._id,
            role: 'student'
        });
        const staffCount = await User.countDocuments({
            organizationId: defaultOrg._id,
            role: { $in: ['admin', 'finance_admin', 'system_admin', 'academic_admin'] }
        });
        const courseCount = await Course.countDocuments({ organizationId: defaultOrg._id });

        defaultOrg.usage.students = studentCount;
        defaultOrg.usage.staff = staffCount;
        defaultOrg.usage.courses = courseCount;
        await defaultOrg.save();

        console.log(`✅ Updated usage statistics:`);
        console.log(`   - Students: ${studentCount}`);
        console.log(`   - Staff: ${staffCount}`);
        console.log(`   - Courses: ${courseCount}\n`);

        console.log('🎉 Migration completed successfully!\n');
        console.log('Summary:');
        console.log(`- Organization: ${defaultOrg.name}`);
        console.log(`- Subdomain: ${defaultOrg.subdomain}.premiumuni.com`);
        console.log(`- Plan: ${defaultOrg.subscription.plan}`);
        console.log(`- Status: ${defaultOrg.subscription.status}\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateToMultiTenant();
