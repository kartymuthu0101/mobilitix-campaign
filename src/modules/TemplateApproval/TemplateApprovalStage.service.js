import { Op } from 'sequelize';
import BaseService from '../../common/BaseService.js';
import TemplateApprovalStageModal from './TemplateApprovalStage.model.js';
import TemplateApprovalModal from './TemplateApproval.model.js';
import UserModal from '../User/User.model.js';

/**
 * Service for master data operations
 */
export default class TemplateApprovalStageService extends BaseService {
    /**
     * Create a new TemplateApprovalStageService instance
     */
    constructor() {
        super(TemplateApprovalStageModal);
    }

    async getStageNeedToEscalate(payload = {}) {
        try {
            const {
                sortBy = 'escalate_at',
                sortOrder = 'ASC', filters = {} } = payload;
            const now = new Date();

            const data = await this.model.findAll({
                where: {
                    ...filters,
                    [Op.and]: [
                        {
                            escalateAt: {
                                [Op.lte]: now
                            }
                        },
                        {
                            escalateAt: {
                                [Op.not]: null
                            }
                        }
                    ],
                    status: 'ACTIVE',
                    isEscalated: false
                },
                include: [
                    {
                        model: TemplateApprovalModal,
                        as: 'approval',
                    }
                ],
                order: [[sortBy, sortOrder.toUpperCase()]],
                raw: true,
            });

            return data;
        } catch (error) {
            throw error;
        }
    }

}