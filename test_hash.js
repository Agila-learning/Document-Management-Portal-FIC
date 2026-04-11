const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Manually load env
const envPath = path.join(__dirname, 'server', '.env');
dotenv.config({ path: envPath });

const userSchema = new mongoose.Schema({
    email: String,
    password: { type: String, select: true }
}, { collection: 'users' });

const User = mongoose.model('User', userSchema);

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const admin = await User.findOne({ email: 'admin@forgeindiaconnect.com' });
        if (admin) {
            console.log('Admin User Found:', admin.email);
            console.log('Hash in DB:', admin.password);
            
            const isMatch = await bcrypt.compare('password123', admin.password);
            console.log('Does password123 match hash? ', isMatch);
        } else {
            console.log('Admin user NOT found.');
        }
        
        await mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}

check();
