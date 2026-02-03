const mongoose = require('mongoose');
require('dotenv').config();
const Organization = require('../models/Organization');

async function onboardSilverMaple() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to Database');

        const existing = await Organization.findOne({ slug: 'silver-maple' });
        if (existing) {
            console.log('⚠️ Silver Maple University already exists!');
            process.exit(0);
        }

        const silverMaple = await Organization.create({
            name: 'Silver Maple University',
            slug: 'silver-maple',
            subdomain: 'silver-maple',
            branding: {
                primaryColor: '#2d5a27', // A forest green
                secondaryColor: '#8a9a5b', // Sage green
                logo: 'https://images.unsplash.com/photo-1590066304602-4f7e0c18455d?auto=format&fit=crop&w=100&h=100',
                heroImage: '/assets/silver_maple_nurses.jpg',
                gallery: ['/assets/silver_maple_graduation.jpg']
            },

            contact: {
                adminEmail: 'chancellor@silvermaple.edu',
                country: 'Zambia'
            },
            subscription: {
                plan: 'professional',
                status: 'active'
            },
            features: {
                whiteLabel: true,
                advancedReporting: true
            }
        });

        console.log('🎉 SUCCESS: Silver Maple University Onboarded!');
        console.log('---------------------------------------------');
        console.log(`ID: ${silverMaple._id}`);
        console.log(`URL: https://${silverMaple.subdomain}.premiumuni.com`);
        console.log(`Branding: ${silverMaple.branding.primaryColor}`);
        console.log('---------------------------------------------');

        process.exit(0);
    } catch (error) {
        console.error('❌ Onboarding failed:', error);
        process.exit(1);
    }
}

onboardSilverMaple();
