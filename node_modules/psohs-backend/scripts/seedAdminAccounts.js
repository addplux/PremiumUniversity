/**
 * Seed Admin Accounts Script (CommonJS)
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const path = require('path');
const readline = require('readline');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

const adminAccounts = [
    {
        firstName: 'System',
        lastName: 'Administrator',
        email: 'system@psohs.ac.zm',
        phone: '0971000001',
        password: 'system123',
        role: 'system_admin',
        city: 'Lusaka',
        isVerified: true
    },
    {
        firstName: 'Finance',
        lastName: 'Administrator',
        email: 'finance@psohs.ac.zm',
        phone: '0971000002',
        password: 'finance123',
        role: 'finance_admin',
        city: 'Lusaka',
        isVerified: true
    },
    {
        firstName: 'Academic',
        lastName: 'Administrator',
        email: 'academic@psohs.ac.zm',
        phone: '0971000003',
        password: 'academic123',
        role: 'academic_admin',
        city: 'Lusaka',
        isVerified: true
    }
];

async function connectDB() {
    // Check if URI is passed via environment variable (preferred for scripts)
    let mongoUrl = process.env.MONGODB_URI;

    // Fallback to local default if no env var
    if (!mongoUrl) {
        mongoUrl = 'mongodb://localhost:27017/psohs';
    }

    try {
        console.log(`📡 Attempting to connect to database...`);
        // Mask the password for safer logging if it exists
        const maskedUrl = mongoUrl.replace(/mongodb(\+srv)?:\/\/([^:]+):([^@]+)@/, 'mongodb$1://$2:****@');
        console.log(`📡 Connection String: ${maskedUrl}`);

        await mongoose.connect(mongoUrl, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Connected to MongoDB');
        console.log(`📂 Database Name: "${mongoose.connection.name}"`);
        console.log(`📊 Existing Users: ${await User.countDocuments()}`);
        console.log('');
    } catch (error) {
        console.error('\n❌ Failed to connect to database.');
        console.log('   Error:', error.message);

        // Interactive fallback
        console.log('\nPlease provide your connection string manually.');
        const manualUrl = await question('📝 Enter MongoDB URI: ');

        try {
            console.log('\n📡 Connecting...');
            await mongoose.connect(manualUrl.trim());
            console.log('✅ Connected to MongoDB\n');
        } catch (retryError) {
            console.error('❌ Connection failed again:', retryError.message);
            process.exit(1);
        }
    }
}

async function seedAdminAccounts() {
    try {
        await connectDB();

        console.log('=== Seeding Admin Accounts ===\n');

        for (const accountData of adminAccounts) {
            // Check if account already exists
            const existingUser = await User.findOne({ email: accountData.email });

            if (existingUser) {
                console.log(`⚠️  User already exists: ${accountData.email}`);
                console.log(`   Updating role to: ${accountData.role}`);

                existingUser.role = accountData.role;
                existingUser.password = accountData.password;
                existingUser.isVerified = true;
                await existingUser.save();

                console.log(`✅ Updated: ${accountData.firstName} ${accountData.lastName}`);
            } else {
                // Create new admin account
                const newAdmin = await User.create(accountData);
                console.log(`✅ Created: ${accountData.firstName} ${accountData.lastName}`);
                console.log(`   Email: ${accountData.email}`);
                console.log(`   Password: ${accountData.password}`);
                console.log(`   Role: ${accountData.role}`);
            }
            console.log('');
        }

        console.log('=== Summary of Test Credentials ===\n');
        console.log('🔧 SYSTEM ADMIN');
        console.log('   Email: system@psohs.ac.zm');
        console.log('   Password: system123');
        console.log('   Access: Full system access, user management, audit logs\n');

        console.log('🏦 FINANCE ADMIN');
        console.log('   Email: finance@psohs.ac.zm');
        console.log('   Password: finance123');
        console.log('   Access: Payment records, fee management, financial reports\n');

        console.log('📚 ACADEMIC ADMIN');
        console.log('   Email: academic@psohs.ac.zm');
        console.log('   Password: academic123');
        console.log('   Access: Courses, grades, assignments, schedules, online classes\n');

        console.log('⚠️  IMPORTANT: These are TEST credentials. Change passwords in production!\n');

    } catch (error) {
        console.error('❌ Error seeding admin accounts:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await mongoose.connection.close();
        console.log('📡 Database connection closed');
        process.exit(0);
    }
}

// Run the script
seedAdminAccounts();
