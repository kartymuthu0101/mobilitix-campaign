import BaseController from '../../common/BaseController.js';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import TemplateLogService from './TemplateLog.service.js';
import { paginate } from '../../helpers/index.js';
import customMessage from '../../helpers/constants/customeMessage.js';

/**
 * Controller for template library operations
 */
export default class TemplateLogController extends BaseController {
    /**
     * Constructor
     */
    constructor() {
        super();
        this.templateLogService = new TemplateLogService();
    }

    /**
     * Get all folders with pagination and filtering
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getTemplateLogs = async (req, res) => {
        const { page = 1, limit = 10, showVersion = 0 } = req.query;
        const skip = (page - 1) * limit;

        const { templateId } = req.params;

        if (!templateId) {
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND,
            );
        }

        const payload = {
            skip,
            limit,
            filters: {
                templateId
            }
        };

        // Add condition if showVersion is true
        if (showVersion === '1' || showVersion === true) {
            payload.filters.changedBlocks = null;
        }

        const data = await this.templateLogService.getTemplateLogs(payload, {
            select: ["action", "createdAt", "id", "performedBy", "notes"]
        });

        this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg.HTTP_OK,
            paginate(data?.data, +page, +limit, +data?.count)
        );
    }

}