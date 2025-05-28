import path from 'path';
import fs from 'fs';
import BaseController from '../../common/BaseController.js';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import RazunaService from './Razuna.service.js';

/**
 * Controller for file upload operations
 */
export default class RazunaController extends BaseController {
    /**
     * Create a new RazunaController instance
     */
    constructor() {
        super();
        this.razunaService = new RazunaService();
    }

    /**
     * Upload files
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    uploadFiles = async (req, res) => {
        try {
            if (!req.files || req.files.length === 0) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    'At least one image is required'
                );
            }
            
            const allowedExtensions = [
                // Images
                '.jpg', '.jpeg', '.png', '.webp',

                // Videos
                '.mp4',

                // Documents
                '.pdf', '.doc', '.docx', '.pptx', '.xlsx',

                // Audio
                '.ogg', '.amr', '.3gp', '.aac', '.mpeg'
            ];

            const invalidFiles = req.files.filter(file => {
                const ext = path.extname(file.originalname).toLowerCase();
                return !allowedExtensions.includes(ext);
            });

            if (invalidFiles.length > 0) {
                // Clean up invalid files
                req.files.forEach(file => fs.unlinkSync(file.path));
                
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    'Only these extensions are allowed (jpg, jpeg, png, webp, mp4, pdf, doc, docx, pptx, xlsx, ogg, amr, 3gp, aac, mpeg)'
                );
            }

            // Generate file URLs
            const fileUrls = req.files.map(file => {
                return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
            });

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg.HTTP_OK,
                fileUrls
            );
        } catch (error) {
            console.error("Error uploading files:", error);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            );
        }
    }
}