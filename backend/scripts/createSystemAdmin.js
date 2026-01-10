/**
 * Bootstrap Script - Create First System Admin
 * 
 * This script creates the first System Admin account for the Premium University system.
 * Run this script ONCE after deploying the new RBAC system.
 * 
 * Usage:
 *   node scripts/createSystemAdmin.js
 * 
 * You will be prompted to enter the admin details.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import readline from 'readline';
import User from '../models/User.js';

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createSystemAdmin() {
    try {
        // Connect to database
        let mongoKey = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/psohs';
        mongoKey = mongoKey.trim().replace(/^\${{/, '').replace(/}}$/, '');

        console.log('📡 Connecting to MongoDB...');
        await mongoose.connect(mongoKey);
        console.log('✅ Connected to MongoDB\n');

        // Get admin details from user
        console.log('=== Create System Admin Account ===\n');

        const firstName = await question('First Name: ');
        const lastName = await question('Last Name: ');
        const email = await question('Email: ');
        const phone = await question('Phone: ');
        const password = await question('Password (min 6 characters): ');

        // Validate inputs
        if (!firstName || !lastName || !email || !phone || !password) {
            console.error('❌ All fields are required!');
            process.exit(1);
        }

        if (password.length < 6) {
            console.error('❌ Password must be at least 6 characters!');
            process.exit(1);
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('❌ User with this email already exists!');
            process.exit(1);
        }

        // Create system admin
        const admin = await User.create({
            firstName,
            lastName,
            email,
            phone,
            password,
            role: 'system_admin',
            isVerified: true
        });

        console.log('\n✅ System Admin created successfully!');
        console.log('\nAdmin Details:');
        console.log(`Name: ${admin.firstName} ${admin.lastName}`);
        console.log(`Email: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
        console.log(`ID: ${admin._id}`);
        console.log('\n⚠️  IMPORTANT: Save these credentials securely!');
        console.log('You can now log in with this account to manage the system.\n');

    } catch (error) {
        console.error('❌ Error creating system admin:', error.message);
        process.exit(1);
    } finally {
        rl.close();
        await mongoose.connection.close();
        process.exit(0);
    }
}

// Run the script
createSystemAdmin();
