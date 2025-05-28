import BaseService from '../../common/BaseService.js';
import User from '../User/User.model.js';
import TemplateLog from './TemplateLog.model.js';

/**
 * Service for master data operations
 */
export default class TemplateLogService extends BaseService {
    /**
     * Create a new TemplateLogService instance
     */
    constructor() {
        super(TemplateLog);
    }


    async getTemplateLogs(payload = {}, returnOption = {}) {
        try {
            const { skip = 0, limit = 10,
                sortBy = 'createdAt',
                sortOrder = 'DESC', filters = {} } = payload;

            const { count, rows } = await this.model.findAndCountAll({
                where: filters,
                offset: parseInt(skip),
                limit: parseInt(limit),
                order: [[sortBy, sortOrder.toUpperCase()]],
                raw: true,
                include: [
                    {
                        model: User, as: "actionBy", attributes: ["id", "first_name"]
                    }
                ],
                ...this._processReturnOptions(returnOption)
            });

            return { data: rows, total: count };
        } catch (error) {
            throw error;
        }
    }

}