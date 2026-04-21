const multer = require('multer');
const { storage } = require('../config/cloudinary');

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
