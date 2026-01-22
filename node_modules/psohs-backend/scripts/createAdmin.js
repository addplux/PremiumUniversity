import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const createAdmin = async () => {
    try {
        const mongoUrl = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/psohs';
        if (!mongoUrl) {
            console.error('MONGO_URI or MONGODB_URI not found in .env and no default provided');
            process.exit(1);
        }

        await mongoose.connect(mongoUrl);
        console.log('Connected to MongoDB...');

        const adminEmail = 'admin@psohs.ac.zm';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Admin user already exists. Updating role to admin...');
            existingAdmin.role = 'admin';
            await existingAdmin.save();
            console.log('Admin role verified for:', adminEmail);
        } else {
            const adminUser = new User({
                firstName: 'System',
                lastName: 'Admin',
                email: adminEmail,
                phone: '0970000000',
                password: 'adminpassword123',
                role: 'admin',
                isVerified: true,
                city: 'Lusaka'
            });

            await adminUser.save();
            console.log('Admin user created successfully!');
            console.log('Email:', adminEmail);
            console.log('Password: adminpassword123');
        }

        mongoose.connection.close();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();
