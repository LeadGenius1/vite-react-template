// Example upload endpoint for Express.js
// Adjust this based on your backend framework (Express, Fastify, Next.js API routes, etc.)

const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error, null);
    }
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter to only accept video files
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska'
  ];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'), false);
  }
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Upload endpoint handler
const uploadHandler = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded'
      });
    }

    // File information
    const fileInfo = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${req.file.filename}` // Adjust based on your static file serving setup
    };

    // Here you would typically:
    // 1. Save file metadata to database
    // 2. Process the video (thumbnail generation, transcoding, etc.)
    // 3. Upload to cloud storage (S3, Cloudinary, etc.)

    console.log('File uploaded successfully:', fileInfo);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: fileInfo
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Handle multer errors
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'File size exceeds the 100MB limit'
      });
    }
    
    res.status(500).json({
      error: error.message || 'Upload failed'
    });
  }
};

// Export the middleware and handler
module.exports = {
  uploadMiddleware: upload.single('video'),
  uploadHandler
};

// Example Express.js route setup:
// const express = require('express');
// const cors = require('cors');
// const { uploadMiddleware, uploadHandler } = require('./api/upload');
// 
// const app = express();
// 
// // Enable CORS for your frontend domain
// app.use(cors({
//   origin: 'https://video-hosting-ad-platform-d3rd84c82vjloo6fo9t0.lp.dev',
//   credentials: true
// }));
// 
// // Upload route
// app.post('/api/upload', uploadMiddleware, uploadHandler);
// 
// // Serve uploaded files statically
// app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// 
// app.listen(3001, () => {
//   console.log('Server running on port 3001');
// });