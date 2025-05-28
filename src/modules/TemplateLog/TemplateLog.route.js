import express from 'express';
import TemplateLogController from './TemplateLog.controller.js';
import { errHandle } from '../../helpers/constants/handleError.js';

const templateLogRouter = express.Router();
const templateLogController = new TemplateLogController();

/**
 * @swagger
 * /api/v1/template_logs/{id}:
 *   get:
 *     summary: Get logs for a template by ID
 *     tags:
 *       - Template Logs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Template ID to retrieve logs for
 *         schema:
 *           type: string
 *           example: 5c4d3263-d69f-4201-8c3d-d06d0a5e5d3d
 *     responses:
 *       200:
 *         description: Successfully retrieved template logs
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
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: a78ca148-e422-44a2-b18f-1fea48a9c1ab
 *                           action:
 *                             type: string
 *                             example: CREATE
 *                           performedBy:
 *                             type: string
 *                             example: 9cd3016a-ab76-464d-a380-bd8abecbd131
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: 2025-05-08T10:58:01.760Z
 *                     pageMeta:
 *                       type: object
 *                       properties:
 *                         size:
 *                           type: number
 *                           example: 10
 *                         page:
 *                           type: number
 *                           example: 1
 *                         total:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *                         totalPages:
 *                           type: number
 *                           nullable: true
 *                           example: null
 *                         hasNextPage:
 *                           type: boolean
 *                           example: false
 *                         hasPrevPage:
 *                           type: boolean
 *                           example: false
 *       404:
 *         description: Template logs not found
 *       500:
 *         description: Internal server error
 */
templateLogRouter.get('/:templateId', [], errHandle(templateLogController.getTemplateLogs));

export default templateLogRouter;