require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Set up Multer Storage with Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'profile_pictures', // Folder in Cloudinary
        allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed file types
        transformation: [{ width: 500, height: 500, crop: 'limit' }] // Resize image
    }
});

const upload = multer({ storage });

module.exports = { upload, cloudinary };
