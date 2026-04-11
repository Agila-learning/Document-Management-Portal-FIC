const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
    // Create subfolders for categories
    const categories = ['MOU', 'NOC', 'SLA', 'Candidate', 'Legal', 'HR', 'Client', 'Miscellaneous'];
    categories.forEach(cat => {
        if (!fs.existsSync(path.join(uploadDir, cat))) {
            fs.mkdirSync(path.join(uploadDir, cat));
        }
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const category = req.body.category || 'Miscellaneous';
        const dest = path.join('uploads', category);
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
