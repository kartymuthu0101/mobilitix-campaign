import BaseService from '../../common/BaseService.js';
import ContentBlock from './ContentBlock.model.js';

/**
 * Service for content block operations
 */
export default class ContentBlockService extends BaseService {
    /**
     * Create a new ContentBlockService instance
     */
    constructor() {
        super(ContentBlock);
    }

    /**
     * Find content blocks by template ID
     * @param {string} templateId - Template ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Content blocks
     */
    async findByTemplateId(templateId, options = {}) {
        try {
            return await this.model.findAll({
                where: { templateId },
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            console.error("Error finding content blocks by template ID:", error);
            throw error;
        }
    }
    
    /**
     * Find global content blocks
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Global content blocks
     */
    async findGlobalBlocks(options = {}) {
        try {
            return await this.model.findAll({
                where: { isGlobal: true },
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            console.error("Error finding global content blocks:", error);
            throw error;
        }
    }
    
    /**
     * Find content blocks by tags
     * @param {Array} tags - Tags to search for
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Content blocks with matching tags
     */
    async findByTags(tags, options = {}) {
        try {
            return await this.model.findAll({
                where: {
                    tags: {
                        [this.model.sequelize.Op.overlap]: Array.isArray(tags) ? tags : [tags]
                    }
                },
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            console.error("Error finding content blocks by tags:", error);
            throw error;
        }
    }
}