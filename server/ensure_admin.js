const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Manually load .env
dotenv.config();

async function ensureAdmin() {
    try {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fic_document_portal';
        console.log('Connecting to:', uri);
        await mongoose.connect(uri);
        
        const adminEmail = 'admin@forgeindiaconnect.com';
        const adminPassword = 'password123';
        
        let admin = await User.findOne({ email: adminEmail });
        
        if (admin) {
            console.log('Found existing admin. Resetting password...');
            admin.password = adminPassword;
            // The pre('save') hook will handle hashing
            await admin.save();
            console.log('Admin password reset successfully.');
        } else {
            console.log('Admin not found. Creating new admin...');
            await User.create({
                username: 'superadmin',
                email: adminEmail,
                password: adminPassword,
                role: 'Super Admin'
            });
            console.log('Admin created successfully.');
        }
        
        await mongoose.disconnect();
        console.log('Done.');
        process.exit(0);
    } catch (err) {
        console.error('Error ensuring admin:', err);
        process.exit(1);
    }
}

ensureAdmin();
