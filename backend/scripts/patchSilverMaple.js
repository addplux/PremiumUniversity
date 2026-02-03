const mongoose = require('mongoose');
require('dotenv').config();
const Organization = require('../models/Organization');

async function patchSilverMaple() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Database');

        const result = await Organization.findOneAndUpdate(
            { slug: 'silver-maple' },
            {
                $set: {
                    'branding.heroImage': '/assets/silver_maple_nurses.jpg',
                    'branding.aboutImage': '/assets/silver_maple_health_section.jpg',
                    'branding.gallery': [
                        '/assets/silver_maple_graduation.jpg',
                        '/assets/silver_maple_graduates_2.jpg',
                        '/assets/silver_maple_nursing_students_1.jpg',
                        '/assets/silver_maple_nursing_students_2.jpg'
                    ]
                }
            },
            { new: true }
        );

        if (result) {
            console.log('🎉 SUCCESS: Silver Maple University Branded with Expanded Gallery!');
            console.log('Hero Image:', result.branding.heroImage);
            console.log('About Image:', result.branding.aboutImage);
            console.log('Gallery Count:', result.branding.gallery.length);
        } else {
            console.log('❌ ERROR: Silver Maple not found');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Patch failed:', error);
        process.exit(1);
    }
}

patchSilverMaple();
