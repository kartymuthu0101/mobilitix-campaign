import BaseService from '../../common/BaseService.js';
import Channel from './Channel.model.js';
import { Op } from 'sequelize';

/**
 * Service for channel operations
 */
export default class ChannelService extends BaseService {
    /**
     * Create a new ChannelService instance
     */
    constructor() {
        super(Channel);
    }
    
    /**
     * Find active channels
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Active channels
     */
    async findActiveChannels(options = {}) {
        try {
            return await this.model.findAll({
                where: { status: 'active' },
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            console.error("Error finding active channels:", error);
            throw error;
        }
    }
    
    /**
     * Find channel by name
     * @param {string} name - Channel name
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} - Channel or null if not found
     */
    async findByName(name, options = {}) {
        try {
            return await this.model.findOne({
                where: { 
                    channel_name: name,
                    status: { [Op.ne]: 'deleted' }
                },
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            console.error("Error finding channel by name:", error);
            throw error;
        }
    }
    
    /**
     * Get channels with template count
     * @param {Object} options - Query options
     * @returns {Promise<Array>} - Channels with template count
     */
    async getChannelsWithTemplateCount(options = {}) {
        try {
            return await this.model.findAll({
                ...this._processReturnOptions(options),
                include: [{
                    model: this.model.sequelize.models.TemplateLibrary,
                    as: 'templates',
                    attributes: []
                }],
                attributes: {
                    include: [
                        [
                            this.model.sequelize.fn('COUNT', 
                            this.model.sequelize.col('templates.id')), 
                            'templateCount'
                        ]
                    ]
                },
                group: ['Channel.id']
            });
        } catch (error) {
            console.error("Error getting channels with template count:", error);
            throw error;
        }
    }
}