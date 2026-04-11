const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Document = require('./models/Document');
const Candidate = require('./models/Candidate');
const ActivityLog = require('./models/ActivityLog');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fic_document_portal');
    
    // Clear existing data
    await User.deleteMany();
    await Document.deleteMany();
    await Candidate.deleteMany();
    await ActivityLog.deleteMany();

    // Create Super Admin
    const superAdmin = await User.create({
      username: 'superadmin',
      email: 'admin@forgeindiaconnect.com',
      password: 'password123',
      role: 'Super Admin'
    });

    console.log('Super Admin created: admin@forgeindiaconnect.com / password123');

    // Create some candidates
    const candidate1 = await Candidate.create({
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
      verificationStatus: 'Verified',
      missingDocuments: []
    });

    const candidate2 = await Candidate.create({
      fullName: 'Jane Smith',
      email: 'jane.smith@example.com',
      phone: '9876543211',
      verificationStatus: 'Pending',
      missingDocuments: ['Aadhaar Card', 'Offer Letter']
    });

    console.log('Dummy candidates created.');

    // Create some Documents
    const docs = await Document.insertMany([
      { title: 'Master Service Agreement - FIC', category: 'SLA', filePath: 'uploads/msa_fic.pdf', uploadedBy: superAdmin._id, status: 'Active', fileSize: 2450000 },
      { title: 'NOC for Remote Access', category: 'NOC', filePath: 'uploads/noc_remote.pdf', uploadedBy: superAdmin._id, status: 'Verified', fileSize: 1200000, expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
      { title: 'Candidate Onboarding Policy', category: 'HR', filePath: 'uploads/hr_onboarding.pdf', uploadedBy: superAdmin._id, status: 'Active', fileSize: 4500000 },
      { title: 'Legal Partnership MOU', category: 'MOU', filePath: 'uploads/mou_legal.pdf', uploadedBy: superAdmin._id, status: 'Active', fileSize: 8500000, expiryDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
      { title: 'Offer Letter - Senior Developer', category: 'Offer Letters', filePath: 'uploads/offer_dev.pdf', uploadedBy: superAdmin._id, status: 'Pending', fileSize: 3200000, candidate: candidate1._id },
      { title: 'System Architecture Design', category: 'Miscellaneous', filePath: 'uploads/arch.png', uploadedBy: superAdmin._id, status: 'Active', fileSize: 5600000 }
    ]);

    console.log('Dummy documents created.');

    // Create Activity Logs
    const activities = [
      { user: superAdmin._id, action: 'LOGIN', targetType: 'System', details: 'Super Admin logged in successfully' },
      { user: superAdmin._id, action: 'UPLOAD', targetType: 'Document', targetId: docs[0]._id, details: 'Uploaded Master Service Agreement' },
      { user: superAdmin._id, action: 'VERIFY', targetType: 'Document', targetId: docs[1]._id, details: 'Verified NOC for Remote Access' },
      { user: superAdmin._id, action: 'UPLOAD', targetType: 'Document', targetId: docs[2]._id, details: 'Uploaded HR Onboarding Policy' },
      { user: superAdmin._id, action: 'EDIT', targetType: 'Candidate', targetId: candidate1._id, details: 'Updated status for John Doe' }
    ];

    // Add some random historical logs
    for(let i=0; i<10; i++) {
        activities.push({
            user: superAdmin._id,
            action: ['VIEW', 'DOWNLOAD', 'EDIT'][Math.floor(Math.random() * 3)],
            targetType: 'Document',
            targetId: docs[Math.floor(Math.random() * docs.length)]._id,
            details: `Performed system interaction ${i+1}`
        });
    }

    await ActivityLog.insertMany(activities);
    console.log('Dummy activity logs created.');

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seedData();
