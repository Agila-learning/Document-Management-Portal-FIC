const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'server', '.env') });

const checkDB = async () => {
  try {
    const User = require('./server/models/User');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fic_document_portal');
    
    const count = await User.countDocuments();
    console.log(`User Count: ${count}`);
    
    if (count > 0) {
      const user = await User.findOne({ email: 'admin@forgeindiaconnect.com' });
      if (user) {
        console.log(`Found User: ${user.email}`);
        console.log(`Username: ${user.username}`);
        console.log(`Role: ${user.role}`);
      } else {
        console.log('User admin@forgeindiaconnect.com NOT found.');
        const allUsers = await User.find({}, { email: 1 });
        console.log('Existing emails:', allUsers.map(u => u.email));
      }
    }
    
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

checkDB();
