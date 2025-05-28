import BaseController from '../../common/BaseController.js';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import TemplateApprovalService from './TemplateApproval.service.js';
import customMessage from '../../helpers/constants/customeMessage.js';
import TemplateLibraryService from '../TemplatesLibrary/TemplatesLibrary.service.js';
import EscalationMatrixService from '../EscalationMatrix/EscalationMatrix.service.js';
import { TEMPLATE_APPROVAL_STATUS, TEMPLATE_LOG_ACTIONS, TEMPLATE_STATUS } from '../../helpers/constants/index.js';
import TemplateApprovalStageService from './TemplateApprovalStage.service.js';
import NotificationService from '../Notification/Notification.service.js';
import UserService from '../User/User.service.js';
import TemplateLogService from '../TemplateLog/TemplateLog.service.js';
import { sequelize } from '../../utils/connectDb.js';
import { addMinutes } from "date-fns"

/**
 * Controller for template library operations
 */
export default class TemplateApprovalController extends BaseController {
    /**
     * Constructor
     */
    constructor() {
        super();
        this.templateApprovalService = new TemplateApprovalService();
        this.templateLibraryService = new TemplateLibraryService()
        this.escalationMatrixService = new EscalationMatrixService()
        this.templateApprovalStageService = new TemplateApprovalStageService()
        this.notificationService = new NotificationService()
        this.userService = new UserService()
        this.templateLogService = new TemplateLogService();
    }

    sendForApproval = async (req, res) => {
        const { templateId } = req.params;
        const { priority, approver: approverEmail, reviewer } = req.body;

        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(templateId))
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                statusMsg[400]
            );
        const template = await this.templateLibraryService.getOne({ id: templateId });

        if (!template)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            );

        if (![TEMPLATE_STATUS.DRAFT].includes(template?.status))
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                statusMsg[400]
            );

        const isExist = await this.templateApprovalService.getOne({
            templateId,
            status: TEMPLATE_APPROVAL_STATUS.ACTIVE
        })

        if (isExist)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                customMessage.TEMPLATE_SUBMITTED_ALREADY
            );

        // validate template for move to approval(check if already in approval, contain all details for submission)

        let approvalRulesResult = await this.escalationMatrixService.getRules();

        const { data: approvalRulesData } = approvalRulesResult?.data || {};

        if (!approvalRulesData || !approvalRulesData.list || !approvalRulesData.list.length)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                customMessage.SETTINGS_NOT_FOUND
            );

        let approvalStages = approvalRulesData?.list.filter(item => ((item?.channelId === template.channelId) && item.status === "ACTIVE" && item.priority === priority))
        if (approvalStages?.length > 1 && !reviewer) {
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                customMessage.REVIEWER_NOT_FOUND
            );
        }
        let approver = approvalStages?.length > 1 ? reviewer : approverEmail;

        const user = await this.userService.findByEmail({ email: approver })
        if (!user?.id)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                customMessage.APPROVER_NOT_FOUND
            );

        if (reviewer) {
            const user = await this.userService.findByEmail({ email: reviewer })
            if (!user?.id)
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    customMessage.REVIEWER_NOT_FOUND
                );
        }

        await sequelize.transaction(async (transaction) => {

            const templateApprovalData = await this.templateApprovalService.create({
                templateId,
                status: TEMPLATE_APPROVAL_STATUS.ACTIVE,
                priority,
                createdBy: req?.user?.id
            }, {}, { transaction })

            await this.templateApprovalStageService.bulkCreate(approvalStages.map(item => {
                if (item?.level == 2)
                    approver = approverEmail
                if (approvalStages?.length > 1 && item.level == 1)
                    approver = reviewer
                return {
                    templateApprovalId: templateApprovalData.id,
                    status: TEMPLATE_APPROVAL_STATUS.ACTIVE,
                    level: item.level,
                    roleId: item?.roleId,
                    timeLimit: item?.timeLimit,
                    warningOffset: item?.warningOffset,
                    warnAt: addMinutes(new Date(), item?.warningOffset),
                    escalateAt: addMinutes(new Date(), item?.timeLimit),
                    approver: approver,
                    escalators: item?.escalators,
                    updatedBy: req?.user?.id || "f4834c75-0f0d-4047-8b94-d3a970ce36ad"
                }
            }), {}, { transaction })

            await this.templateLogService.create({
                action: TEMPLATE_LOG_ACTIONS.SUBMITTED_FOR_APPROVAL,
                performedBy: req?.user?.id,
                templateId,
                newStatus: TEMPLATE_STATUS.PENDING,
                previousStatus: TEMPLATE_STATUS.DRAFT
            }, {}, { transaction })

            await this.templateLibraryService.update(templateId, {
                status: TEMPLATE_STATUS.PENDING
            }, {}, { transaction })


            const notificationResult = await this.notificationService.create({
                type: approvalStages?.length > 1 ? "SEND_FOR_REVIEW" : "SEND_FOR_APPROVAL",
                templateId,
                sendTo: user?.id,
                fromUser: req?.user?.id,
            })

        })
        // await transaction.commit();
        this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg.HTTP_OK,
            customMessage.SEND_FOR_APPROVAL
        );
    }

    approveTemplate = async (req, res) => {
        const { templateId } = req.params;
        const { notes } = req.body;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(templateId))
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                statusMsg[400]
            );

        const template = await this.templateLibraryService.getOne({ id: templateId });

        if (!template)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            );

        const templateApprovalData = await this.templateApprovalService.getOne({
            templateId,
            status: TEMPLATE_APPROVAL_STATUS.ACTIVE
        })

        if (!templateApprovalData)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            );

        const stagesData = await this.templateApprovalStageService.getAll({
            templateApprovalId: templateApprovalData?.id,
            status: TEMPLATE_APPROVAL_STATUS?.ACTIVE,
        }, {
            raw: true
        });

        if (!stagesData?.length)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                statusMsg[400],
                // customMessage.TEMPLATE_APPROVED
            );

        let currentStage = stagesData.find(item => item?.level == 1);

        if (!currentStage)
            currentStage = stagesData[0];

        if (currentStage?.approver != req?.user?.email)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_FORBIDDEN,
                statusMsg[403],
            );
        await sequelize.transaction(async (transaction) => {

            this.templateApprovalStageService.update(currentStage?.id, {
                status: TEMPLATE_APPROVAL_STATUS?.APPROVED,
                updatedBy: req.user?.id,
            }, {}, { transaction })

            // UPDATE LOGS
            await this.templateLogService.create({
                action: (stagesData?.length > 1) ? TEMPLATE_LOG_ACTIONS.REVIEWED : TEMPLATE_LOG_ACTIONS.APPROVED,
                performedBy: req?.user?.id,
                templateId,
                newStatus: (stagesData?.length > 1) ? TEMPLATE_STATUS.PENDING : TEMPLATE_STATUS.APPROVED,
                previousStatus: TEMPLATE_STATUS.PENDING,
                notes
            }, {}, { transaction })

            if (!(stagesData?.length > 1)) // if final stage
            {
                this.templateApprovalService.update(templateApprovalData?.id, { status: TEMPLATE_APPROVAL_STATUS.APPROVED }, {}, { transaction })

                await this.templateLibraryService.update(templateId, {
                    status: TEMPLATE_STATUS.APPROVED
                }, {}, { transaction })

                await this.notificationService.create({
                    type: "ACCEPTED",
                    templateId,
                    sendTo: templateApprovalData?.createdBy,
                    fromUser: req?.user?.id,
                })
                // publish the listing
            } else {
                await this.notificationService.create({
                    type: "REVIEWED",
                    templateId,
                    sendTo: templateApprovalData?.createdBy,
                    fromUser: req?.user?.id,
                })
                let currentStage = stagesData.find(item => item?.level == 2);

                const user = await this.userService.findByEmail({ email: currentStage?.approver })

                await this.notificationService.create({
                    type: "SEND_FOR_APPROVAL",
                    templateId,
                    sendTo: user?.id,
                    fromUser: req?.user?.id,
                })
            }
        })

        // validate template for move to approval(check if already in approval, contain all details for submission)

        return this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg.HTTP_OK,
            customMessage.TEMPLATE_APPROVED
        );
    }

    rejectTemplate = async (req, res) => {

        const { templateId } = req.params;
        const { notes } = req.body;
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(templateId))
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                statusMsg[400]
            );

        const template = await this.templateLibraryService.getOne({ id: templateId });

        if (!template)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            );

        const templateApprovalData = await this.templateApprovalService.getOne({
            templateId,
            status: TEMPLATE_APPROVAL_STATUS.ACTIVE
        })

        if (!templateApprovalData)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            );

        const stagesData = await this.templateApprovalStageService.getAll({
            templateApprovalId: templateApprovalData?.id,
            status: TEMPLATE_APPROVAL_STATUS?.ACTIVE,
        }, {
            raw: true
        });

        if (!stagesData?.length)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_BAD_REQUEST,
                statusMsg[400],
                // customMessage.TEMPLATE_APPROVED
            );

        let currentStage = stagesData.find(item => item?.level == 1);

        if (!currentStage)
            currentStage = stagesData[0];

        if (currentStage?.approver != req?.user?.email)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_FORBIDDEN,
                statusMsg[403],
            );
        await sequelize.transaction(async (transaction) => {

            await this.templateLibraryService.update(templateId, {
                status: TEMPLATE_STATUS.REJECTED
            }, {}, { transaction })

            this.templateApprovalStageService.update(currentStage?.id, {
                status: TEMPLATE_APPROVAL_STATUS?.REJECTED
            }, {}, { transaction })


            const notificationResult = await this.notificationService.create({
                type: "REJECTED",
                templateId,
                sendTo: templateApprovalData?.createdBy,
                fromUser: req?.user?.id,
            })

            this.templateApprovalService.update(templateApprovalData?.id, { status: TEMPLATE_APPROVAL_STATUS.REJECTED }, {}, { transaction })

            await this.templateLogService.create({
                action: TEMPLATE_LOG_ACTIONS.REJECTED,
                performedBy: req?.user?.id,
                templateId,
                newStatus: TEMPLATE_STATUS.APPROVED,
                previousStatus: TEMPLATE_STATUS.PENDING,
                notes
            }, {}, { transaction })
        })
        return this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg.HTTP_OK,
            customMessage.TEMPLATE_REJECTED
        );
    }


    getTemplateApproval = async (req, res) => {

        const { templateId } = req.params;

        if (!templateId) {
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND,
            );
        }

        const templateApprovalData = await this.templateApprovalService.getApprovalData({
            templateId,
            status: TEMPLATE_APPROVAL_STATUS.ACTIVE
        })

        if (!templateApprovalData)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_APPROVAL_NOT_FOUND
            );

        this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg.HTTP_OK,
            templateApprovalData
        );
    }

}