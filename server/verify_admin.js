const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function verify() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        const admin = await User.findOne({ email: 'admin@forgeindiaconnect.com' });
        if (admin) {
            console.log('Found Admin User:', admin.email);
            console.log('Username:', admin.username);
            console.log('Role:', admin.role);
            // We can't see the password, but we know password123 is the fallback
        } else {
            console.log('Admin user NOT FOUND. Creating it now...');
            const newAdmin = await User.create({
                username: 'admin',
                email: 'admin@forgeindiaconnect.com',
                password: 'password123',
                role: 'Super Admin'
            });
            console.log('Admin user created successfully.');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
