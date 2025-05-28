import BaseService from '../../common/BaseService.js';
import TemplateApprovalModal from './TemplateApproval.model.js';
import TemplateApprovalStage from './TemplateApprovalStage.model.js';
import UserModal from '../User/User.model.js';

/**
 * Service for master data operations
 */
export default class TemplateApprovalService extends BaseService {
    /**
     * Create a new TemplateApprovalService instance
     */
    constructor() {
        super(TemplateApprovalModal);
    }

    async getApprovalData(condition = {}, returnOption = {}, options = {}) {
        try {
            return await this.model.findOne({
                where: condition,
                ...this._processReturnOptions(returnOption),
                ...options,
                // raw: true,
                include: [
                    {
                        model: TemplateApprovalStage,
                        as: "stages",
                        include: [
                            { model: UserModal, as: 'actionBy', attributes: ["id", "first_name"] },
                        ]
                    }
                ]
            });
        } catch (error) {
            throw error;
        }
    }

}