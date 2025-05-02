const express = require('express');
const UserController = require('./User.controller.js');
const validator = require('./User.validatory.js');

const userRouter = express.Router();

const userController = new UserController();

// Define routes using controller methods
/**
 * @swagger
 * /user:
 *   get:
 *     summary: Returns a greeting
 *     responses:
 *       200:
 *         description: A successful response
 */
userRouter.get('/', userController.getAll);
userRouter.post('/create', [validator.userCreateInput], userController.create);

module.exports = userRouter;