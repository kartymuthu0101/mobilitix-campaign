const express = require('express');
const RazonaController = require('./Razuna.controller.js');
const validator = require('./Razuna.validatory.js');
const { errHandle } = require('../../helpers/constants/handleError.js');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const razonaRouter = express.Router();

const razonaController = new RazonaController();

const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const sanitizedFileName = file.originalname.replace(/\s+/g, '-').toLowerCase();
        cb(null, sanitizedFileName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extname && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpg, jpeg, png, gif)'));
    }
};

const upload = multer({ storage, fileFilter });

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

razonaRouter.post('/upload', upload.array('files', 5), errHandle(razonaController.uploadFiles));

module.exports = razonaRouter;