import BaseController from '../../common/BaseController.js';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import ChannelService from './Channel.service.js';

/**
 * Controller for channel operations
 */
export default class ChannelController extends BaseController {
    /**
     * Create a new ChannelController instance
     */
    constructor() {
        super();
        this.channelService = new ChannelService();
    }

    /**
     * Create a new channel
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    create_channel = async (req, res) => {
        try {
            // Check if channel with same name already exists
            const existingChannel = await this.channelService.findByName(req.body.channel_name);
            
            if (existingChannel) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_CONFLICT,
                    'Channel with this name already exists',
                    existingChannel
                );
            }
            
            // Add user ID if available
            if (req.user?.id) {
                req.body.createdById = req.user.id;
            }
            
            const data = await this.channelService.create(req.body);
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_CREATED,
                'Channel created successfully',
                data
            );
        } catch (error) {
            console.error("Error creating channel:", error);
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
     * Get all channels
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAllChannels = async (req, res) => {
        try {
            // Check for status filter
            const { status } = req.query;
            let condition = {};
            
            if (status) {
                condition.status = status;
            }
            
            const data = await this.channelService.getAll(condition, {
                // include: [{
                //     model: this.channelService.model.sequelize.models.User,
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
            console.error("Error fetching channels:", error);
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
     * Get channel by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getChannelById = async (req, res) => {
        try {
            const { id } = req.params;
            
            const channel = await this.channelService.getOne({ id }, {
                // include: [{
                //     model: this.channelService.model.sequelize.models.User,
                //     as: 'createdBy',
                //     attributes: ['id', 'firstName', 'lastName', 'email']
                // }]
            });
            
            if (!channel) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    'Channel not found',
                    null
                );
            }
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg[200],
                channel
            );
        } catch (error) {
            console.error("Error fetching channel:", error);
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
     * Update channel
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    updateChannel = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            // Add user ID if available
            if (req.user?.id) {
                updateData.updatedById = req.user.id;
            }
            
            const updated = await this.channelService.update(id, updateData);
            
            if (!updated) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    'Channel not found',
                    null
                );
            }
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                'Channel updated successfully',
                updated
            );
        } catch (error) {
            console.error("Error updating channel:", error);
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