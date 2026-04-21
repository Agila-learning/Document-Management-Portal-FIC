const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const company = req.body.companyName || 'Unassigned';
    const category = req.body.category || 'Miscellaneous';
    
    // Ensure folder structure in Cloudinary
    const folderPath = `FIC_Portal/${company}/${category}`;
    
    return {
      folder: folderPath,
      resource_type: 'auto', // Important for PDFs and other non-image files
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      format: file.originalname.split('.').pop(), // Keep original extension
    };
  },
});

module.exports = { cloudinary, storage };
