const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');
const fs = require('fs');

let upload;

// Use Cloudinary if credentials are provided via env, otherwise fall back to local disk storage
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });

    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'nexchat_media',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'mp3', 'webm']
        }
    });

    upload = multer({ storage: storage });
} else {
    // Use memory storage to avoid creating local public folders.
    // Files will be returned as base64 data URLs so they can be stored elsewhere (DB) if desired.
    const storage = multer.memoryStorage();
    upload = multer({ storage });
}

router.post('/media', upload.single('file'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: "No file uploaded" });

        // If Cloudinary was used, multer provides a `path` (HTTP URL)
        if (req.file.path && req.file.path.startsWith('http')) {
            return res.json({ url: req.file.path });
        }

        // For memoryStorage fallback: return a base64 data URL so the client/server
        // can store it in DB or embed in messages without writing to disk.
        if (req.file && req.file.buffer) {
            const mime = req.file.mimetype || 'application/octet-stream';
            const base64 = req.file.buffer.toString('base64');
            const dataUrl = `data:${mime};base64,${base64}`;
            return res.json({ url: dataUrl });
        }

        return res.status(500).json({ error: 'Unable to process uploaded file' });
    } catch (err) {
        console.error('Upload error', err);
        res.status(500).json({ error: "Upload failed" });
    }
});

module.exports = router;