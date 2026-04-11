const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { getDashboardStats } = require('./controllers/statsController');

dotenv.config();

const test = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fic_document_portal');
        
        // Mock req/res
        const req = { user: { role: 'Super Admin' } };
        const res = {
            json: (data) => console.log('STATS DATA:', JSON.stringify(data, null, 2)),
            status: (code) => ({ json: (err) => console.error('ERROR:', err) })
        };

        await getDashboardStats(req, res);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

test();
