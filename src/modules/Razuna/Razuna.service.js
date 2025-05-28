import BaseService from '../../common/BaseService.js';

/**
 * Service for file upload operations
 */
export default class RazunaService extends BaseService {
    /**
     * Create a new RazunaService instance
     */
    constructor() {
        super();
    }
    
    /**
     * Process uploaded files
     * @param {Array} files - Array of file objects
     * @param {Object} options - Processing options
     * @returns {Promise<Array>} - Processed file information
     */
    async processFiles(files, options = {}) {
        try {
            const { resize = false, optimize = false } = options;
            
            // Process file information
            const processedFiles = files.map(file => ({
                filename: file.filename,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size,
                path: file.path
            }));
            
            return processedFiles;
        } catch (error) {
            console.error("Error processing files:", error);
            throw error;
        }
    }
}