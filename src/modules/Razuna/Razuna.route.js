import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import RazunaController from './Razuna.controller.js';
import validator from './Razuna.validatory.js';
import { errHandle } from '../../helpers/constants/handleError.js';

const razunaRouter = express.Router();
const razunaController = new RazunaController();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(process.cwd(), 'src/modules/Razuna/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const sanitizedFileName = file.originalname.replace(/\s+/g, '-').toLowerCase();
        cb(null, `${Date.now()}-${sanitizedFileName}`);
    }
});

// File filter function
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|mp4|pdf|doc|docx|pptx|xlsx|ogg|amr|3gp|aac|mpeg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only these extensions are allowed (jpg, jpeg, png, webp, mp4, pdf, doc, docx, pptx, xlsx, ogg, amr, 3gp, aac, mpeg)'));
    }
};

// Configure multer upload
const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

/**
 * @swagger
 * /api/v1/razuna/upload:
 *   post:
 *     summary: Upload multiple files
 *     tags:
 *       - Razuna
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Array of files to upload
 *     responses:
 *       200:
 *         description: Successfully uploaded files
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: http://localhost:2036/uploads/photo_2022-01-20_16-17-30.jpg
 *       400:
 *         description: Bad Request - Invalid files or request data
 *       500:
 *         description: Internal Server Error
 */
razunaRouter.post(
    '/upload', 
    upload.array('files', 5),
    errHandle(razunaController.uploadFiles)
);

export default razunaRouter;