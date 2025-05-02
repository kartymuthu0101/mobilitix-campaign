const express = require('express');
const MasterController = require('./Channel.controller.js');
const validator = require('./Channel.validatory.js');
const { errHandle } = require('../../helpers/constants/handleError.js');
const {checkPermission} = require("../../common/middlewares/verifyToken.js");

const channelRouter = express.Router();

const channelController = new MasterController();

/**
 * @swagger
 * /api/v1/channel_data/channel:
 *   post:
 *     summary: Create a new communication channel
 *     tags:
 *       - Channel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel_name:
 *                 type: string
 *                 example: "Web Push Notification"
 *               description:
 *                 type: string
 *                 example: "Web Push Notification channel"
 *               status:
 *                 type: string
 *                 example: "active"
 *     responses:
 *       200:
 *         description: Successfully created a new communication channel
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
 *                     channel_name:
 *                       type: string
 *                       example: "Web Push Notification"
 *                     description:
 *                       type: string
 *                       example: "Web Push Notification channel"
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     createdBy:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     updatedBy:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     _id:
 *                       type: string
 *                       example: "680b8aaddd6e5ca7bc709ee1"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-25T13:14:21.495Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-04-25T13:14:21.495Z"
 *                     __v:
 *                       type: integer
 *                       example: 0
 *                     id:
 *                       type: string
 *                       example: "680b8aaddd6e5ca7bc709ee1"
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Internal server error
 */

channelRouter.post('/channel', [checkPermission("create"), validator.createChannel], errHandle(channelController.create_channel));
/**
 * @swagger
 * /api/v1/channel_data/channel:
 *   get:
 *     summary: Get all communication channels
 *     tags:
 *       - Channel
 *     responses:
 *       200:
 *         description: Successfully retrieved all communication channels
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "Success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "680b8a7cdd6e5ca7bc709edd"
 *                       channel_name:
 *                         type: string
 *                         example: "WhatsApp"
 *                       description:
 *                         type: string
 *                         example: "WhatsApp channel"
 *                       status:
 *                         type: string
 *                         example: "active"
 *                       createdBy:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       updatedBy:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-25T13:13:32.029Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-04-25T13:13:32.029Z"
 *                       __v:
 *                         type: integer
 *                         example: 0
 *                       id:
 *                         type: string
 *                         example: "680b8a7cdd6e5ca7bc709edd"
 *       404:
 *         description: Channels not found
 *       500:
 *         description: Internal server error
 */
channelRouter.get('/channel', [], errHandle(channelController.getAllChannels));

module.exports = channelRouter;