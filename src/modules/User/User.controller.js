import BaseController from '../../common/BaseController.js';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import UserService from './User.service.js';

/**
 * Controller for handling user-related operations
 */
export default class UserController extends BaseController {
    /**
     * Create a new UserController instance
     */
    constructor() {
        super();
        this.userService = new UserService();
    }

    /**
     * Get all users
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAll = async (req, res) => {
        try {
            const data = await this.userService.getAll();
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg[200],
                data
            );
        } catch (error) {
            console.error('Error fetching users:', error);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            );
        }
    }

    /**
     * Create a new user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    create = async (req, res) => {
        try {
            const data = await this.userService.create(req.body);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_CREATED,
                statusMsg[201],
                data
            );
        } catch (error) {
            console.error('Error creating user:', error);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            );
        }
    }

    /**
     * Get user by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getById = async (req, res) => {
        try {
            const { id } = req.params;
            
            const user = await this.userService.getOne({ id });
            
            if (!user) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    'User not found',
                    null
                );
            }
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg[200],
                user
            );
        } catch (error) {
            console.error('Error fetching user:', error);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            );
        }
    }

    /**
     * Update user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    update = async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;
            
            const updatedUser = await this.userService.update(id, updateData);
            
            if (!updatedUser) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    'User not found',
                    null
                );
            }
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                'User updated successfully',
                updatedUser
            );
        } catch (error) {
            console.error('Error updating user:', error);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            );
        }
    }

    /**
     * Delete user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    delete = async (req, res) => {
        try {
            const { id } = req.params;
            
            const deletedUser = await this.userService.delete(id);
            
            if (!deletedUser) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    'User not found',
                    null
                );
            }
            
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                'User deleted successfully',
                { id }
            );
        } catch (error) {
            console.error('Error deleting user:', error);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            );
        }
    }
}