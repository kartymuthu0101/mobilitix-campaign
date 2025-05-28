import BaseService from '../../common/BaseService.js';
import User from './User.model.js';

/**
 * Service for handling user-related operations
 */
export default class UserService extends BaseService {
    /**
     * Create a new UserService instance
     */
    constructor() {
        super(User);
    }

    /**
     * Find a user by email
     * @param {Object} params - Search parameters
     * @param {string} params.email - Email to search for
     * @returns {Promise<Object|null>} - Found user or null
     */
    async findByEmail({ email }) {
        try {
            return await this.model.findOne({
                where: { email, isDeleted: false }
            });
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw error;
        }
    }
    
    /**
     * Find a user with permissions
     * @param {string} userId - User ID
     * @returns {Promise<Object|null>} - User with permissions or null
     */
    async findWithPermissions(userId) {
        try {
            const user = await this.model.findByPk(userId, {
                include: [{
                    model: Role,
                    as: 'roles',
                    attributes: ['name'],
                    include: [{
                        model: Permission,
                        as: 'permissions',
                        attributes: ['name']
                    }]
                }]
            });
            
            if (!user) return null;
            
            // Extract permission names into a simple array
            const permissions = user.roles.flatMap(role => 
                role.permissions.map(permission => permission.name)
            );
            
            // Create a simplified user object with permissions
            return {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                permissions
            };
        } catch (error) {
            console.error('Error finding user with permissions:', error);
            throw error;
        }
    }
    
    /**
     * Search users with filtering and pagination
     * @param {Object} params - Search parameters
     * @param {number} params.page - Page number
     * @param {number} params.limit - Results per page
     * @param {string} params.search - Search term
     * @returns {Promise<Object>} - Search results with pagination metadata
     */
    async searchUsers({ page = 1, limit = 10, search = '' }) {
        try {
            const offset = (page - 1) * limit;
            let whereClause = {};
            
            // Apply search filter if provided
            if (search) {
                whereClause = {
                    [Op.or]: [
                        { firstName: { [Op.iLike]: `%${search}%` } },
                        { lastName: { [Op.iLike]: `%${search}%` } },
                        { email: { [Op.iLike]: `%${search}%` } }
                    ]
                };
            }
            
            // Execute query with pagination
            const { count, rows } = await this.model.findAndCountAll({
                where: whereClause,
                attributes: ['id', 'firstName', 'lastName', 'email', 'roles', 'createdAt'],
                limit,
                offset,
                order: [['createdAt', 'DESC']]
            });
            
            // Format pagination metadata
            return {
                data: rows,
                pagination: {
                    total: count,
                    page,
                    limit,
                    pages: Math.ceil(count / limit)
                }
            };
        } catch (error) {
            console.error('Error searching users:', error);
            throw error;
        }
    }
}