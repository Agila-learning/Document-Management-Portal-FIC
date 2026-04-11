const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Manually load env since we are at root
const envPath = 'c:/FORGE_INDIA_CONNECT/FIC_Document-Management-Portal/server/.env';
const envContent = fs.readFileSync(envPath, 'utf8');
const mongoUri = envContent.match(/MONGODB_URI=(.*)/)[1].trim();

const UserSchema = new mongoose.Schema({
  email: String,
  password: { type: String, select: true }
}, { collection: 'users' });

const User = mongoose.model('User', UserSchema);

async function check() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to:', mongoUri);
    
    const count = await User.countDocuments();
    console.log('User Count:', count);
    
    const admin = await User.findOne({ email: 'admin@forgeindiaconnect.com' });
    if (admin) {
      console.log('Admin User Found:', admin.email);
      console.log('Password Hash in DB:', admin.password);
    } else {
      console.log('Admin User NOT found.');
      const all = await User.find({}, { email: 1 });
      console.log('Emails in DB:', all.map(u => u.email));
    }
    
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
