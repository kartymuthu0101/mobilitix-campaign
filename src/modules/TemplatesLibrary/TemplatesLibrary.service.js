// src/modules/TemplatesLibrary/TemplatesLibrary.service.js
const BaseService = require("../../common/BaseService.js");
const { TemplateLibrary, SharedContent, User, Channel, ContentBlock } = require("../../models");
const { Op, QueryTypes } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');
const { TEMPLATE_STATUS } = require('../../helpers/constants/index.js');

class TemplateLibraryService extends BaseService {
    constructor() {
        super(TemplateLibrary);
    }

    async findOneWithContentBlocks(condition = {}, options = {}) {
        try {
            return await this.model.findOne({
                where: condition,
                include: [{
                    model: ContentBlock,
                    as: 'contentBlocks',
                    attributes: {
                        exclude: ['__v', 'isGlobal', 'createdAt', 'updatedAt']
                    },
                    through: { attributes: [] }
                }],
                ...this._processReturnOptions(options)
            });
        } catch (error) {
            throw error;
        }
    }

    async findFolderGroupCount(folderId) {
        try {
            const result = await sequelize.query(`
                WITH RECURSIVE folder_chain AS (
                    SELECT id, "parentId", 0 AS depth
                    FROM template_libraries
                    WHERE id = :folderId
                    
                    UNION ALL
                    
                    SELECT tl.id, tl."parentId", fc.depth + 1
                    FROM template_libraries tl
                    JOIN folder_chain fc ON tl.id = fc."parentId"
                )
                SELECT * FROM folder_chain
                ORDER BY depth ASC;
            `, {
                replacements: { folderId },
                type: QueryTypes.SELECT
            });

            return [{ parentChain: result }];
        } catch (error) {
            throw error;
        }
    }

    async checkFolderNameExistance(folderId, userId, name, type) {
        try {
            // Build query with user permissions
            const folders = await this.model.findOne({
                where: {
                    type: type,
                    name: name,
                    status: { [Op.ne]: TEMPLATE_STATUS.DELETED },
                    [Op.or]: [
                        { createdById: userId },
                        {
                            id: {
                                [Op.in]: sequelize.literal(`(
                                    SELECT "templateId" FROM shared_content 
                                    WHERE "userId" = '${userId}' 
                                    AND "deletedAt" IS NULL
                                )`)
                            }
                        }
                    ],
                    ...(folderId ? { parentId: folderId } : { parentId: null })
                }
            });

            return folders;
        } catch (error) {
            throw error;
        }
    }

    async getPaginatedFolderList(payload = {}) {
        try {
            const {
                skip = 0,
                limit = 10,
                filters = {},
                startDate,
                endDate,
                channelId,
                parentId,
                folderLocation,
                search,
                id
            } = payload;

            // Build where clause
            let whereClause = { ...filters };

            if (channelId) {
                whereClause.channelId = channelId;
            }

            if (parentId) {
                whereClause.parentId = parentId;
            }

            if (folderLocation) {
                whereClause.folderLocation = folderLocation;
            }

            if (search) {
                whereClause.name = { [Op.iLike]: `%${search}%` };
            }

            if (startDate || endDate) {
                whereClause.createdAt = {};

                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    whereClause.createdAt[Op.gte] = start;
                }

                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    whereClause.createdAt[Op.lte] = end;
                }
            }

            // Add user access conditions
            whereClause[Op.or] = [
                { createdById: id },
                {
                    id: {
                        [Op.in]: sequelize.literal(`(
                            SELECT "templateId" FROM shared_content 
                            WHERE "userId" = '${id}' 
                            AND "deletedAt" IS NULL
                        )`)
                    }
                }
            ];

            // Query with includes
            const { count, rows } = await this.model.findAndCountAll({
                where: whereClause,
                include: [
                    {
                        model: Channel,
                        as: 'channel',
                        attributes: ['id', 'channel_name', 'description', 'status']
                    },
                    {
                        model: TemplateLibrary,
                        as: 'parent',
                        attributes: ['id', 'name']
                    },
                    {
                        model: TemplateLibrary,
                        as: 'folder',
                        attributes: ['id', 'name']
                    },
                    {
                        model: TemplateLibrary,
                        as: 'layout',
                        attributes: ['id', 'name']
                    },
                    {
                        model: User,
                        as: 'createdBy',
                        attributes: ['id', 'email', 'firstName', 'lastName']
                    },
                    {
                        model: User,
                        as: 'sharedWith',
                        attributes: ['id', 'email', 'firstName', 'lastName'],
                        through: { attributes: [] }
                    },
                    {
                        model: ContentBlock,
                        as: 'contentBlocks',
                        attributes: ['id', 'type', 'content'],
                        through: { attributes: [] }
                    }
                ],
                order: [['createdAt', 'DESC']],
                offset: parseInt(skip),
                limit: parseInt(limit)
            });

            return { data: rows, total: count };
        } catch (error) {
            throw error;
        }
    }

    async getSharedFolderUsers(id) {
        try {
            const result = await this.model.findByPk(id, {
                include: [{
                    model: User,
                    as: 'sharedWith',
                    attributes: ['id', 'email'],
                    through: {
                        model: SharedContent,
                        attributes: ['accessType', 'sharedAt']
                    }
                }],
                attributes: ['id', 'name']
            });

            return result ? [result] : [];
        } catch (error) {
            throw error;
        }
    }

    async updateSharedUsers(id, userIdsToAdd = [], userIdsToRemove = [], options = {}) {
        const transaction = options.transaction || await sequelize.transaction();

        try {
            const template = await this.model.findByPk(id, { transaction });

            if (!template) {
                if (!options.transaction) await transaction.rollback();
                return null;
            }

            // Add users
            if (userIdsToAdd.length > 0) {
                const addPromises = userIdsToAdd.map(userId =>
                    SharedContent.create({
                        templateId: id,
                        userId,
                        accessType: 'read',
                        sharedById: options.sharedById || null,
                        sharedAt: new Date()
                    }, { transaction })
                );

                await Promise.all(addPromises);
            }

            // Remove users
            if (userIdsToRemove.length > 0) {
                await SharedContent.destroy({
                    where: {
                        templateId: id,
                        userId: { [Op.in]: userIdsToRemove }
                    },
                    transaction
                });
            }

            // Reload the template with updated associations
            const updatedTemplate = await this.model.findByPk(id, {
                include: [{
                    model: User,
                    as: 'sharedWith',
                    attributes: ['id', 'email'],
                    through: { attributes: ['accessType'] }
                }],
                transaction
            });

            if (!options.transaction) await transaction.commit();

            return updatedTemplate;
        } catch (error) {
            if (!options.transaction) await transaction.rollback();
            throw error;
        }
    }
}

module.exports = TemplateLibraryService;
