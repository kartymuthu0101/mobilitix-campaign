import express from 'express';
import TemplateApprovalController from './TemplateApproval.controller.js';
import { errHandle } from '../../helpers/constants/handleError.js';
import { approveTemplateInput, rejectTemplateInput, sendForApprovalInput } from './TemplatesApproval.validatory.js';
import { checkPermission } from '../../common/middlewares/verifyToken.js';

const templateApprovalRouter = express.Router();
const templateApprovalController = new TemplateApprovalController();

/**
 * @swagger
 * /api/v1/template_approval/{templateId}:
 *   post:
 *     summary: Send a template for approval
 *     tags:
 *       - Template Approval
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         description: The ID of the template to send for approval
 *         schema:
 *           type: string
 *           example: 63e53015-f340-4abe-aafe-435dcdb67085
 *       - in: query
 *         name: isEnc
 *         required: false
 *         description: Whether the request body is encrypted (1 for true, 0 for false)
 *         schema:
 *           type: integer
 *           example: 0
 *     requestBody:
 *       required: true
 *       description: Approval details for the template
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attachments:
 *                 type: string
 *                 description: Optional attachment link or ID
 *                 example: "file_abc123"
 *               notes:
 *                 type: string
 *                 description: Optional notes for the approver or reviewer
 *                 example: "Please review urgently"
 *               approver:
 *                 type: string
 *                 format: email
 *                 description: Email of the primary approver
 *                 example: approver@example.com
 *               reviewer:
 *                 type: string
 *                 format: email
 *                 description: Optional reviewer email
 *                 example: reviewer@example.com
 *               priority:
 *                 type: string
 *                 enum: [HIGH, MEDIUM, LOW]
 *                 description: Priority level for approval routing
 *                 example: HIGH
 *     responses:
 *       200:
 *         description: Template sent for approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: Send for approval
 *       400:
 *         description: Invalid input or validation error
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
templateApprovalRouter.post('/:templateId', [checkPermission("whatsappTemplate:create"), sendForApprovalInput], errHandle(templateApprovalController.sendForApproval));

/**
 * @swagger
 * /api/v1/template_approval/{templateId}/approve:
 *   post:
 *     summary: Approve a submitted template
 *     tags:
 *       - Template Approval
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         description: The ID of the template to approve
 *         schema:
 *           type: string
 *           example: 63e53015-f340-4abe-aafe-435dcdb67085
 *       - in: query
 *         name: isEnc
 *         required: false
 *         description: Whether the request body is encrypted (1 for true, 0 for false)
 *         schema:
 *           type: integer
 *           example: 0
 *     requestBody:
 *       required: true
 *       description: Approval metadata
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attachments:
 *                 type: string
 *                 description: Optional attachment reference
 *                 example: "file_abc123"
 *               notes:
 *                 type: string
 *                 description: Optional notes by approver
 *                 example: "Looks good. Approved."
 *     responses:
 *       200:
 *         description: Template approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: Template approved successfully
 *       400:
 *         description: Invalid input or validation error
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
templateApprovalRouter.post('/:templateId/approve', [checkPermission(), approveTemplateInput], errHandle(templateApprovalController.approveTemplate));

/**
 * @swagger
 * /api/v1/template_approval/{templateId}/reject:
 *   post:
 *     summary: Reject a submitted template
 *     tags:
 *       - Template Approval
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         description: The ID of the template to approve
 *         schema:
 *           type: string
 *           example: 63e53015-f340-4abe-aafe-435dcdb67085
 *       - in: query
 *         name: isEnc
 *         required: false
 *         description: Whether the request body is encrypted (1 for true, 0 for false)
 *         schema:
 *           type: integer
 *           example: 0
 *     requestBody:
 *       required: true
 *       description: Approval metadata
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               attachments:
 *                 type: string
 *                 description: Optional attachment reference
 *                 example: "file_abc123"
 *               notes:
 *                 type: string
 *                 description: Optional notes by approver
 *                 example: "Looks good. Approved."
 *     responses:
 *       200:
 *         description: Template approved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: string
 *                   example: Template approved successfully
 *       400:
 *         description: Invalid input or validation error
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
templateApprovalRouter.post('/:templateId/reject', [checkPermission(), rejectTemplateInput], errHandle(templateApprovalController.rejectTemplate));

/**
 * @swagger
 * /api/v1/template_approval/{templateId}:
 *   get:
 *     summary: Get template approval details
 *     tags:
 *       - Template Approval
 *     parameters:
 *       - in: path
 *         name: templateId
 *         required: true
 *         description: The ID of the template to retrieve approval details for
 *         schema:
 *           type: string
 *           example: 0f3c71ae-4ec5-4818-ac41-879b24b3cbc7
 *       - in: query
 *         name: isEnc
 *         required: false
 *         description: Whether the response should be decrypted (1 for true, 0 for false)
 *         schema:
 *           type: integer
 *           example: 0
 *     responses:
 *       200:
 *         description: Template approval details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: ebf57201-44f3-432c-a753-c1baea8e5bac
 *                     templateId:
 *                       type: string
 *                       example: 0f3c71ae-4ec5-4818-ac41-879b24b3cbc7
 *                     status:
 *                       type: string
 *                       example: ACTIVE
 *                     priority:
 *                       type: string
 *                       example: HIGH
 *                     createdBy:
 *                       type: string
 *                       format: uuid
 *                       example: bbaec9c2-cc12-442b-be7a-570d74c72540
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-15T12:07:12.832Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-05-15T12:07:12.832Z
 *                     stages:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: ca7cfb26-ca7b-4116-b54e-277f44b95a07
 *                           templateApprovalId:
 *                             type: string
 *                             example: ebf57201-44f3-432c-a753-c1baea8e5bac
 *                           status:
 *                             type: string
 *                             example: ACTIVE
 *                           level:
 *                             type: integer
 *                             example: 1
 *                           roleId:
 *                             type: string
 *                             example: 448c8302-82cb-4d57-b0a7-6c76efa17514
 *                           timeLimit:
 *                             type: integer
 *                             example: 60
 *                           warningOffset:
 *                             type: integer
 *                             example: 40
 *                           approver:
 *                             type: string
 *                             format: email
 *                             example: bhuvaneshwaran@doodle-blue.com
 *                           escalators:
 *                             type: array
 *                             items:
 *                               type: string
 *                               format: email
 *                               example: dhananjayan.s.n@doodleblue.in
 *                           updatedBy:
 *                             type: string
 *                             example: bbaec9c2-cc12-442b-be7a-570d74c72540
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-05-15T12:07:12.834Z
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-05-15T12:07:12.834Z
 *       404:
 *         description: Template not found
 *       500:
 *         description: Internal server error
 */
templateApprovalRouter.get('/:templateId/', [checkPermission()], errHandle(templateApprovalController.getTemplateApproval));

export default templateApprovalRouter;