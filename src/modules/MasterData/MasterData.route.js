const express = require('express');
const MasterController = require('./MasterData.controller.js');
const validator = require('./MasterData.validator.js');

const masterDataRouter = express.Router();

const masterController = new MasterController();

masterDataRouter.post('/', [validator.createMasterData], masterController.create);

/**
 * @swagger
 * /api/v1/master_data:
 *   get:
 *     summary: Retrieve master data with pagination
 *     tags:
 *       - Master Data
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of records to fetch per page
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           example: 2
 *       - in: query
 *         name: type
 *         required: false
 *         description: type name
 *         schema:
 *           type: string
 *           example: TEMPLATE_TYPE
 *     responses:
 *       200:
 *         description: Successfully retrieved master data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             example: 680f9aa4ac0ef97b70e4abd4
 *                           key:
 *                             type: string
 *                             example: English
 *                           value:
 *                             type: string
 *                             example: en
 *                     total:
 *                       type: integer
 *                       example: 2
 *       400:
 *         description: Bad request (Invalid query parameters)
 *       404:
 *         description: Master data not found
 *       500:
 *         description: Internal server error
 */

masterDataRouter.get('/', [validator.getAll], masterController.getAll);

module.exports = masterDataRouter;