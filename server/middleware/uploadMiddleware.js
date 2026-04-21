const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure base uploads directory exists - using absolute path relative to this file
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('--- Upload Debug ---');
        console.log('Body:', req.body);
        console.log('File originalname:', file.originalname);
        
        const company = req.body.companyName || 'Unassigned';
        const category = req.body.category || 'Miscellaneous';
        const dest = path.join(uploadDir, company, category);
        
        console.log('Target Destination:', dest);
        
        if (!fs.existsSync(dest)) {
            fs.mkdirSync(dest, { recursive: true });
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    // Allowing all file types as per user request
    cb(null, true);
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: fileFilter
});

module.exports = upload;
