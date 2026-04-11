const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function resetAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
        
        await User.deleteOne({ email: 'admin@forgeindiaconnect.com' });
        console.log('Old Admin deleted.');

        const newAdmin = await User.create({
            username: 'admin',
            email: 'admin@forgeindiaconnect.com',
            password: 'password123',
            role: 'Super Admin'
        });
        
        console.log('Admin user recreated with password123.');
        console.log('New Hash in DB:', newAdmin.password);
        
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
    }
}

resetAdmin();
