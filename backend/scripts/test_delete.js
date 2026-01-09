
import mongoose from 'mongoose';
import User from '../models/User.js';
import Application from '../models/Application.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoKey = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/psohs';

async function test() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(mongoKey);
        console.log('Connected.');

        // 1. Get/Create Admin
        let adminUser = await User.findOne({ role: 'admin' });
        if (!adminUser) {
            console.log('Creating temp admin user...');
            adminUser = await User.create({
                firstName: 'Test',
                lastName: 'Admin',
                email: 'testadmin@example.com',
                password: 'password123',
                role: 'admin',
                phone: '1234567890'
            });
        }
        console.log('Admin ID:', adminUser._id);

        const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET || 'secret', {
            expiresIn: '1d'
        });

        // 2. Create Dummy Application
        let appUser = await User.findOne({ email: 'testappuser@example.com' });
        if (!appUser) {
            appUser = await User.create({
                firstName: 'Test',
                lastName: 'User',
                email: 'testappuser@example.com',
                password: 'password',
                role: 'student',
                phone: '0987654321'
            });
        }

        // Clean up any existing app for this user
        await Application.deleteMany({ user: appUser._id });

        const newApp = await Application.create({
            user: appUser._id,
            program: 'Registered Nursing',
            personalInfo: {
                firstName: 'Test', lastName: 'User', dateOfBirth: new Date(),
                gender: 'Male', nationality: 'Zambian', phone: '0987654321',
                email: 'testappuser@example.com', address: '123 St'
            },
            academicInfo: {
                grade12School: 'Test School', grade12Year: 2020
            }
        });
        console.log('Dummy Application created:', newApp._id);

        // 3. Call DELETE Endpoint
        console.log('Sending DELETE request...');
        const response = await fetch(`http://localhost:5000/api/applications/${newApp._id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response Status:', response.status);
        const data = await response.json();
        console.log('Response Data:', data);

        if (response.status === 200 && data.success) {
            console.log('SUCCESS: Application deleted via API.');
            // Verify DB
            const check = await Application.findById(newApp._id);
            if (!check) console.log('VERIFIED: Application not found in DB.');
            else console.log('FAILED: Application still exists in DB?');
        } else {
            console.log('FAILED: API returned error.');
        }

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await mongoose.disconnect();
    }
}

test();
