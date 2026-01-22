const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const resetAdminPassword = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        if (!mongoURI) {
            throw new Error('MONGODB_URI not found in environment variables');
        }

        console.log('📡 Connecting to production database...');
        await mongoose.connect(mongoURI);
        console.log('✅ Connected.');

        const email = 'admin@psohs.ac.zm';
        const newPassword = 'admin123';

        console.log(`🔐 Looking for user: ${email}`);
        const user = await User.findOne({ email });

        if (!user) {
            console.log('❌ User not found. Creating new admin account...');
            await User.create({
                firstName: 'System',
                lastName: 'Admin',
                email,
                phone: '0970000000', // Added dummy phone number
                password: newPassword,
                role: 'system_admin',
                isVerified: true
            });
            console.log('✅ Created new system admin account.');
        } else {
            console.log('🔄 User found. Updating password and role...');
            user.password = newPassword;
            user.role = 'system_admin';
            user.isVerified = true;
            user.phone = user.phone || '0970000000'; // Ensure phone exists
            await user.save();
            console.log('✅ Password and role updated successfully.');
        }

        console.log('\n--- Credentials ---');
        console.log(`Email: ${email}`);
        console.log(`Password: ${newPassword}`);
        console.log('-------------------\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('📡 Database connection closed.');
        process.exit(0);
    }
};

resetAdminPassword();
