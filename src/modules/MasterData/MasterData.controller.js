import BaseController from '../../common/BaseController.js';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import MasterDataService from './MasterData.service.js';

/**
 * Controller for master data operations
 */
export default class MasterController extends BaseController {
    /**
     * Create a new MasterController instance
     */
    constructor() {
        super();
        this.masterDataService = new MasterDataService();
    }

    /**
     * Create master data entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    create = async (req, res) => {
        try {
            // Add user ID if available
            if (req.user?.id) {
                req.body.createdById = req.user.id;
            }
            
            // Check for existing entry
            const existing = await this.masterDataService.findByTypeAndKey(
                req.body.type,
                req.body.key
            );
            
            if (existing) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_CONFLICT,
                    'Entry with this type and key already exists',
                    existing
                );
            }
            
            // Create new entry
            const data = await this.masterDataService.create(req.body);

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_CREATED,
                'Master data created successfully',
                data
            );
        } catch (error) {
            console.error("Error creating master data:", error);
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

    /**
     * Get paginated master data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAll = async (req, res) => {
        try {
            const { page = 1, limit = 10, type, ...otherFilters } = req.query || {};

            const skip = (page - 1) * limit;
            const filters = { type, ...otherFilters };

            const data = await this.masterDataService.getPaginated({
                skip,
                limit,
                filters
            }, {
                select: "id key value type createdAt",
                // include: [{
                //     model: this.masterDataService.model.sequelize.models.User,
                //     as: 'createdBy',
                //     attributes: ['id', 'firstName', 'lastName', 'email']
                // }]
            });

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg[200],
                data
            );
        } catch (error) {
            console.error("Error fetching master data:", error);
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
    
    /**
     * Get master data by type
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getByType = async (req, res) => {
        try {
            const { type } = req.params;
            
            const data = await this.masterDataService.findByType(type, {
                attributes: ['id', 'key', 'value']
            });
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg[200],
                data
            );
        } catch (error) {
            console.error("Error fetching master data by type:", error);
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
    
    /**
     * Get grouped master data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getGrouped = async (req, res) => {
        try {
            const data = await this.masterDataService.getGroupedByType();
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg[200],
                data
            );
        } catch (error) {
            console.error("Error fetching grouped master data:", error);
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
    
    /**
     * Update master data entry
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    update = async (req, res) => {
        try {
            const { id } = req.params;
            const { value } = req.body;
            
            // Only allow updating value
            const updated = await this.masterDataService.update(id, { value });
            
            if (!updated) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    'Master data entry not found',
                    null
                );
            }
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                'Master data updated successfully',
                updated
            );
        } catch (error) {
            console.error("Error updating master data:", error);
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
    
    /**
     * Bulk upsert master data
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    bulkUpsert = async (req, res) => {
        try {
            const { data } = req.body;
            
            if (!Array.isArray(data) || data.length === 0) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    'Data must be a non-empty array',
                    null
                );
            }
            
            // Add user ID if available
            const items = data.map(item => ({
                ...item,
                createdById: req.user?.id
            }));
            
            const result = await this.masterDataService.bulkUpsert(items);
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                'Master data updated successfully',
                result
            );
        } catch (error) {
            console.error("Error in bulk upsert master data:", error);
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