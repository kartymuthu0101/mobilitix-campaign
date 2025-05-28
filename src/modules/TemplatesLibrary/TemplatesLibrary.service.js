import BaseService from '../../common/BaseService.js';
import { Op, QueryTypes, fn, col, where, literal } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import { TEMPLATE_STATUS, TEMPLATE_TYPE } from '../../helpers/constants/index.js';
import db from "../../database/models/index.js"

/**
 * Service for handling template library operations
 */
export default class TemplateLibraryService extends BaseService {
    /**
     * Create a new TemplateLibraryService instance
     */
    constructor() {
        super(db.TemplateLibrary);
    }

    /**
     * Find a template with its content blocks
     * @param {Object} condition - Where conditions
     * @param {Object} options - Additional options
     * @returns {Promise<Object|null>} - Template with content blocks or null
     */
    async findOneWithContentBlocks(condition = {}, options = {}, txOptions = {}) {
        try {
            return await this.model.findOne({
                where: condition,
                include: [{
                    model: this.model.sequelize.models.ContentBlock,
                    as: 'contentBlocks',
                    attributes: {
                        exclude: ['__v', 'isGlobal', 'createdAt', 'updatedAt']
                    },
                    through: { attributes: [] }
                }],
                ...this._processReturnOptions(options),
                // raw: true,
                transaction: txOptions.transaction
            });
        } catch (error) {
            throw error;
        }
    }

    /**
     * Find folder chain recursively
     * @param {string} folderId - Folder ID
     * @returns {Promise<Array>} - Array with folder chain
     */
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

    /**
     * Check if folder name exists in the same directory
     * @param {string} folderId - Parent folder ID
     * @param {string} userId - User ID
     * @param {string} name - Folder name to check
     * @param {string} type - Type to check
     * @returns {Promise<Object|null>} - Found folder or null
     */
    async checkFolderNameExistance(folderId, userId, name, type) {
        try {
            // Build query with user permissions
            const folder = await this.model.findOne({
                where: {
                    type,
                    name,
                    status: { [Op.ne]: TEMPLATE_STATUS.DELETED },
                    [Op.or]: [
                        { createdById: userId },
                        {
                            id: {
                                [Op.in]: sequelize.literal(`(
                                    SELECT "templateId" FROM shared_content 
                                    WHERE "userId" = '${userId}'
                                )`)
                            }
                        }
                    ],
                    ...(folderId ? { parentId: folderId } : { parentId: null })
                }
            });

            return folder;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get paginated folder list with filters
     * @param {Object} payload - Pagination and filtering options
     * @returns {Promise<Object>} - Paginated results
     */

    async getPaginatedFolderList(payload = {}) {
        try {
            const {
                offset = 0,
                limit = 10,
                channelId,
                parentId,
                search,
                id, // User ID
                onlyShared = false,
                sortBy = null,
                sortOrder = null,
                sortType = null
            } = payload;

            // Default sort values if not provided
            const actualSortBy = sortBy || 'updatedAt';
            const actualSortOrder = sortOrder !== null ? parseInt(sortOrder) : -1;

            const isGlobalSearchBool = search ? true : false;
            const onlySharedBool = onlyShared === 'true' ? true : false;

            const modelName = this.model.name;
            const tableName = this.model.tableName;

            // Shared template IDs and their sharing details
            let sharedTemplateIds = [];
            let sharedParentIds = [];
            let accessibleItemsWithOrigin = new Map(); // Maps item ID to sharing origin info
            let sharedContentMap = new Map(); // Maps template ID to SharedContent record

            if (id && (onlySharedBool || isGlobalSearchBool)) {
                // Get directly shared items with full SharedContent details
                const sharedContentResult = await this.model.sequelize.models.SharedContent.findAll({
                    where: { userId: id },
                    include: [
                        {
                            model: this.model.sequelize.models.User,
                            as: 'sharedBy',
                            attributes: ['id', 'email']
                        }
                    ],
                    raw: false
                });

                // Process shared content records
                for (const sharedContent of sharedContentResult) {
                    const templateId = sharedContent.templateId;
                    sharedTemplateIds.push(templateId);
                    sharedContentMap.set(templateId, {
                        id: sharedContent.id,
                        accessType: sharedContent.accessType,
                        sharedById: sharedContent.sharedById,
                        sharedAt: sharedContent.sharedAt,
                        sharedBy: sharedContent.sharedBy,
                        originTemplateId: templateId, // This is the original shared item
                        isDirectShare: true
                    });
                }

                // Identify which shared items are folders (potential parents)
                if (sharedTemplateIds.length > 0) {
                    const folderResult = await this.model.findAll({
                        attributes: ['id'],
                        where: {
                            id: { [Op.in]: sharedTemplateIds },
                            type: TEMPLATE_TYPE.FOLDER
                        },
                        raw: true
                    });
                    sharedParentIds = folderResult.map(row => row.id);

                    // Get all descendant items of shared folders with their sharing origin using recursive CTE
                    if (sharedParentIds.length > 0) {
                        const descendantsQuery = `
                        WITH RECURSIVE folder_descendants AS (
                            -- Base case: directly shared folders with their sharing info
                            SELECT 
                                t.id, 
                                t."parentId", 
                                t.name, 
                                t.type,
                                t.id as origin_template_id,
                                0 as depth_level
                            FROM "${tableName}" t
                            WHERE t.id IN (${sharedParentIds.map(id => `'${id}'`).join(',')})
                            AND t.status != '${TEMPLATE_STATUS.DELETED}'
                            
                            UNION ALL
                            
                            -- Recursive case: children of already found items
                            SELECT 
                                t.id, 
                                t."parentId", 
                                t.name, 
                                t.type,
                                fd.origin_template_id,
                                fd.depth_level + 1
                            FROM "${tableName}" t
                            INNER JOIN folder_descendants fd ON t."parentId" = fd.id
                            WHERE t.status != '${TEMPLATE_STATUS.DELETED}'
                        )
                        SELECT 
                            id, 
                            origin_template_id,
                            depth_level
                        FROM folder_descendants 
                        WHERE depth_level > 0  -- Exclude the original shared folders themselves
                    `;

                        const descendantsResult = await this.model.sequelize.query(descendantsQuery, {
                            type: this.model.sequelize.QueryTypes.SELECT
                        });

                        // Map descendants to their sharing origin
                        for (const descendant of descendantsResult) {
                            const originSharedContent = sharedContentMap.get(descendant.origin_template_id);
                            if (originSharedContent) {
                                accessibleItemsWithOrigin.set(descendant.id, {
                                    ...originSharedContent,
                                    originTemplateId: descendant.origin_template_id,
                                    isDirectShare: false,
                                    inheritedFromParent: true,
                                    depthLevel: descendant.depth_level
                                });
                            }
                        }
                    }
                }
            }

            // Helper function to get sharing origin for an item
            const getItemSharingOrigin = (itemId) => {
                // Check if directly shared
                if (sharedContentMap.has(itemId)) {
                    return sharedContentMap.get(itemId);
                }

                // Check if accessible via shared parent
                if (accessibleItemsWithOrigin.has(itemId)) {
                    return accessibleItemsWithOrigin.get(itemId);
                }

                return null;
            };

            // Build where clause
            let whereClause = { status: { [Op.ne]: TEMPLATE_STATUS.DELETED } };

            if (search) {
                whereClause.name = { [Op.iLike]: `%${search}%` };
            }

            if (channelId) {
                whereClause.channelId = channelId;
            }

            // Handle ancestry logic differently depending on context
            if (!isGlobalSearchBool) {
                if (parentId) {
                    whereClause.parentId = parentId;
                } else {
                    whereClause.parentId = { [Op.is]: null };
                }
            }

            // Get all accessible item IDs
            const allAccessibleIds = [...sharedTemplateIds, ...Array.from(accessibleItemsWithOrigin.keys())];

            // Handle access control differently based on sharing context
            if (id) {
                if (onlySharedBool) {
                    if (parentId) {
                        // Check if current parent or any of its ancestors is shared
                        const parentSharingOrigin = getItemSharingOrigin(parentId);

                        if (parentSharingOrigin || allAccessibleIds.includes(parentId)) {
                            // Parent is accessible, show all its direct children
                            // No additional filters needed
                        } else {
                            // Parent not accessible, show only directly shared items
                            if (allAccessibleIds.length > 0) {
                                whereClause = {
                                    ...whereClause,
                                    id: { [Op.in]: allAccessibleIds },
                                    createdById: { [Op.ne]: id }
                                };
                            } else {
                                return { data: [], count: 0 };
                            }
                        }
                    } else {
                        // Root level
                        if (allAccessibleIds.length > 0) {
                            whereClause = {
                                ...whereClause,
                                [Op.and]: [
                                    { id: { [Op.in]: allAccessibleIds } },
                                    { createdById: { [Op.ne]: id } }
                                ]
                            };
                        } else {
                            return { data: [], count: 0 };
                        }
                    }
                } else {
                    // Normal view - user's own content + shared content
                    let accessConditions = [];

                    // User's own content
                    accessConditions.push({ createdById: id });

                    // All accessible content (direct + inherited)
                    if (allAccessibleIds.length > 0) {
                        accessConditions.push({ id: { [Op.in]: allAccessibleIds } });
                    }

                    whereClause = {
                        ...whereClause,
                        [Op.or]: accessConditions
                    };
                }
            }

            // Get an accurate count first with a separate query
            const count = await this.model.count({
                where: whereClause,
                distinct: true
            });

            if (count === 0) {
                return { data: [], count: 0 };
            }

            // Create enhanced isShared calculation that includes sharing origin info
            const isSharedLiteral = allAccessibleIds.length > 0
                ? this.model.sequelize.literal(`(
            CASE WHEN "${modelName}"."id" IN (${allAccessibleIds.map(id => `'${id}'`).join(',')})
                 AND "${modelName}"."createdById" != '${id}'
                 THEN true ELSE false END
          )`)
                : this.model.sequelize.literal(`false`);

            // Create folder child count (type = FOLDER)
            const folderChildCountLiteral = this.model.sequelize.literal(`(
            SELECT COUNT(*) FROM "${tableName}" AS "folder_children"
            WHERE "folder_children"."parentId" = "${modelName}"."id"
            AND "folder_children"."type" = '${TEMPLATE_TYPE.FOLDER}'
            AND "folder_children"."status" != '${TEMPLATE_STATUS.DELETED}'
        )`);

            // Create template child count (type = TEMPLATE)
            const templateChildCountLiteral = this.model.sequelize.literal(`(
            SELECT COUNT(*) FROM "${tableName}" AS "template_children"
            WHERE "template_children"."parentId" = "${modelName}"."id"
            AND "template_children"."type" = '${TEMPLATE_TYPE.TEMPLATE}'
            AND "template_children"."status" != '${TEMPLATE_STATUS.DELETED}'
        )`);

            // Create total child count
            const childCountLiteral = this.model.sequelize.literal(`(
            SELECT COUNT(*) FROM "${tableName}" AS "children"
            WHERE "children"."parentId" = "${modelName}"."id"
            AND "children"."status" != '${TEMPLATE_STATUS.DELETED}'
        )`);

            // Generate the appropriate order array
            let orderArray = [];

            if (sortType) {
                if (sortType === 'FOLDER_FIRST') {
                    orderArray.push([
                        this.model.sequelize.literal(`CASE WHEN "${modelName}"."type" = '${TEMPLATE_TYPE.FOLDER}' THEN 0 ELSE 1 END`),
                        'ASC'
                    ]);
                } else if (sortType === 'TEMPLATE_FIRST') {
                    orderArray.push([
                        this.model.sequelize.literal(`CASE WHEN "${modelName}"."type" = '${TEMPLATE_TYPE.TEMPLATE}' THEN 0 ELSE 1 END`),
                        'ASC'
                    ]);
                }
            }

            const sortDirection = actualSortOrder === 1 ? 'ASC' : 'DESC';

            if (actualSortBy === 'folderChildCount') {
                orderArray.push([folderChildCountLiteral, sortDirection]);
            } else if (actualSortBy === 'templateChildCount') {
                orderArray.push([templateChildCountLiteral, sortDirection]);
            } else if (actualSortBy === 'childCount') {
                orderArray.push([childCountLiteral, sortDirection]);
            } else {
                orderArray.push([actualSortBy, sortDirection]);
            }

            if (actualSortBy !== 'name') {
                orderArray.push(['name', 'ASC']);
            }

            if (actualSortBy !== 'id') {
                orderArray.push(['id', 'ASC']);
            }

            // Use findAll with includes - only get the latest TemplateApproval
            const rows = await this.model.findAll({
                attributes: {
                    include: [
                        [childCountLiteral, 'childCount'],
                        [folderChildCountLiteral, 'folderChildCount'],
                        [templateChildCountLiteral, 'templateChildCount'],
                        [isSharedLiteral, 'isShared']
                    ]
                },
                where: whereClause,
                include: [
                    {
                        model: this.model,
                        as: 'parent',
                        attributes: ['id', 'name'],
                        required: false
                    }
                ],
                order: orderArray,
                offset: parseInt(offset),
                limit: parseInt(limit),
                subQuery: false
            });

            // Fetch content blocks and template approvals separately to handle latest approval logic
            const rowsWithContentBlocks = await Promise.all(rows.map(async (row) => {
                const item = row.toJSON();

                // Fetch content blocks
                const contentBlocks = await this.findOneWithContentBlocks({
                    id: item.id
                }, {
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'isPublished', 'type', 'currentVersion']
                    }
                });

                // Fetch only the latest TemplateApproval for this template
                const latestApproval = await this.model.sequelize.models.TemplateApproval.findOne({
                    where: { templateId: item.id },
                    attributes: ['id', 'status', 'priority', 'createdBy'],
                    order: [['createdAt', 'DESC']], // Get the most recent one
                    limit: 1
                });

                // Add sharing origin information
                const sharingOrigin = getItemSharingOrigin(item.id);

                return {
                    ...item,
                    contentBlocks: contentBlocks?.contentBlocks || [],
                    templateApproval: latestApproval ? latestApproval.toJSON() : null,
                    sharingOrigin: sharingOrigin ? {
                        sharedContentId: sharingOrigin.id,
                        accessType: sharingOrigin.accessType,
                        sharedById: sharingOrigin.sharedById,
                        sharedAt: sharingOrigin.sharedAt,
                        sharedBy: sharingOrigin.sharedBy,
                        originTemplateId: sharingOrigin.originTemplateId,
                        isDirectShare: sharingOrigin.isDirectShare,
                        inheritedFromParent: sharingOrigin.inheritedFromParent || false,
                        depthLevel: sharingOrigin.depthLevel || 0
                    } : null
                };
            }));

            return { data: rowsWithContentBlocks, count };
        } catch (error) {
            console.error('Error in getPaginatedFolderList:', error);
            throw error;
        }
    }

    /**
     * Get users with access to a folder
     * @param {string} id - Folder ID
     * @returns {Promise<Array>} - Array with users
     */
    async getSharedFolderUsers(id) {
        try {
            const result = await this.model.findByPk(id, {
                include: [{
                    model: this.model.sequelize.models.User,
                    as: 'sharedWith',
                    attributes: ['id', 'email'],
                    through: {
                        model: this.model.sequelize.models.SharedContent,
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

    /**
     * Update shared users for a template
     * @param {string} id - Template ID
     * @param {Array} userIdsToAdd - User IDs to add
     * @param {Array} userIdsToRemove - User IDs to remove
     * @param {Object} options - Additional options
     * @returns {Promise<Object|null>} - Updated template or null
     */
    async updateSharedUsers(id, addOrUpdateUsers = [], userIdsToRemove = [], options = {}) {
        const transaction = options.transaction || await sequelize.transaction();

        try {
            const template = await this.model.findByPk(id, { transaction });

            if (!template) {
                if (!options.transaction) await transaction.rollback();
                return null;
            }

            // Add or update users
            if (addOrUpdateUsers.length > 0) {
                const SharedContent = this.model.sequelize.models.SharedContent;

                // Find existing shared content records for these users
                const existingShares = await SharedContent.findAll({
                    where: {
                        templateId: id,
                        userId: {
                            [Op.in]: addOrUpdateUsers.map(user => user.userId)
                        }
                    },
                    transaction
                });

                // Map of existing shares by userId for quick lookup
                const existingSharesByUserId = existingShares.reduce((acc, share) => {
                    acc[share.userId] = share;
                    return acc;
                }, {});

                // Process each user: update if exists, create if not
                const upsertPromises = addOrUpdateUsers.map(async ({ userId, permission }) => {
                    if (existingSharesByUserId[userId]) {
                        // Update existing share
                        return existingSharesByUserId[userId].update({
                            accessType: permission,
                            updatedAt: new Date()
                        }, { transaction });
                    } else {
                        // Create new share
                        return SharedContent.create({
                            templateId: id,
                            userId,
                            accessType: permission,
                            sharedById: options.sharedById || null,
                            sharedAt: new Date()
                        }, { transaction });
                    }
                });

                await Promise.all(upsertPromises);
            }

            // Remove users - this logic remains the same
            if (userIdsToRemove.length > 0) {
                const SharedContent = this.model.sequelize.models.SharedContent;
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
                    model: this.model.sequelize.models.User,
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

    async createTemplateBlock(payload = {}, options) {
        try {
            const TemplateBlock = this.model.sequelize.models.TemplateBlock;

            return await TemplateBlock.create(payload, options);
        } catch (error) {
            throw error;
        }
    }



    async deleteTemplateBlocks(condition = {}, options) {
        try {
            const TemplateBlock = this.model.sequelize.models.TemplateBlock;

            return await TemplateBlock.destroy({
                where: condition
            }, options);
        } catch (error) {
            throw error;
        }
    }

    async searchGlobalTemplates(payload = {}, userId) {
        try {
            const {
                offset = 0,
                limit = 10,
                search,
                includeShared = true // New parameter to control whether to include shared content
            } = payload;

            let whereClause = {};

            if (search) {
                whereClause.name = { [Op.iLike]: `%${search}%` }; // Added % for partial matches
            } else {
                whereClause.parentId = { [Op.eq]: null };
            }

            // Get list of matched templates
            const { count, rows } = await this.model.findAndCountAll({
                where: whereClause,
                order: [['updatedAt', 'DESC']],
                offset: parseInt(offset),
                limit: parseInt(limit)
            });

            // Get IDs of possible parent folders
            const parentIds = rows.map(row => row.id);

            // Query to count children grouped by parentId
            const childrenCountsRaw = await this.model.findAll({
                attributes: [
                    'parentId',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'childCount']
                ],
                where: {
                    parentId: { [Op.in]: parentIds }
                },
                group: ['parentId']
            });

            // Convert raw result to object for quick lookup
            const childrenCounts = {};
            childrenCountsRaw.forEach(item => {
                childrenCounts[item.parentId] = parseInt(item.get('childCount'));
            });

            // Generate breadcrumbs for each template
            const breadcrumbsPromises = rows.map(async (row) => {
                return this.generateBreadcrumbs(row.id);
            });

            const breadcrumbsResults = await Promise.all(breadcrumbsPromises);

            // Create a map of template id to its breadcrumbs
            const breadcrumbsMap = {};
            rows.forEach((row, index) => {
                breadcrumbsMap[row.id] = breadcrumbsResults[index];
            });

            // Add childCount and breadcrumbs fields to each result
            let enrichedRows = rows.map(row => {
                const obj = row.toJSON();
                obj.childCount = childrenCounts[obj.id] || 0;
                obj.breadcrumbs = breadcrumbsMap[obj.id];
                obj.isShared = false; // Default to not shared
                return obj;
            });
            // Get shared content if requested
            if (includeShared) {
                // Get shared templates from shared_content table
                const sharedTemplatesQuery = {
                    // Assuming shared_content has contentType and contentId fields
                    userId: userId
                    // Add any additional conditions as needed
                };

                // if (search) {
                //     // We might need a join here depending on your data structure
                //     // This is a simplified example
                //     sharedTemplatesQuery.name = { [Op.iLike]: `%${search}%` };
                // }
                const sharedContent = await this.model.sequelize.models.SharedContent.findAll({
                    where: sharedTemplatesQuery,
                    include: [{
                        model: this.model,
                        as: 'template',
                        required: true
                    }],
                    order: [['updatedAt', 'DESC']]
                });
                // Process shared templates
                const sharedTemplatesPromises = sharedContent.map(async (sharedItem) => {
                    const template = sharedItem.template;

                    // Get breadcrumbs for shared template
                    const breadcrumbs = await this.generateBreadcrumbs(template.id);

                    // Count children
                    const childCount = await this.model.count({
                        where: { parentId: template.id }
                    });

                    const templateObj = template.toJSON();
                    templateObj.childCount = childCount;
                    templateObj.breadcrumbs = breadcrumbs;
                    templateObj.isShared = true;
                    templateObj.sharedInfo = {
                        sharedId: sharedItem.id,
                        sharedBy: sharedItem.sharedBy,
                        sharedAt: sharedItem.createdAt
                        // Add any other shared-specific fields
                    };

                    return templateObj;
                });

                const sharedTemplates = await Promise.all(sharedTemplatesPromises);

                // Combine regular and shared templates
                enrichedRows = [...enrichedRows, ...sharedTemplates];

                // Re-sort by updatedAt
                enrichedRows.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

                // Apply pagination to the combined result
                // Note: This is a simple implementation. For large datasets, 
                // you might want to optimize the query instead
                const startIndex = parseInt(offset);
                const endIndex = startIndex + parseInt(limit);
                enrichedRows = enrichedRows.slice(startIndex, endIndex);
                return { data: enrichedRows, total: count + (includeShared ? sharedContent.length : 0) };
            }

            return { data: enrichedRows, total: count };

        } catch (error) {
            console.error('Error in searchGlobalTemplates:', error);
            throw error;
        }
    }

    // Helper method to generate breadcrumbs (unchanged)
    async generateBreadcrumbs(templateId) {
        const breadcrumbs = [];
        let currentTemplateId = templateId;

        // To prevent infinite loops in case of circular references
        const processedIds = new Set();

        while (currentTemplateId && !processedIds.has(currentTemplateId)) {
            processedIds.add(currentTemplateId);

            const template = await this.model.findByPk(currentTemplateId, {
                attributes: ['id', 'name', 'parentId']
            });

            if (!template) break;

            // Add to the beginning of the array to maintain hierarchy order
            breadcrumbs.unshift({
                id: template.id,
                name: template.name
            });

            // Move up to the parent
            currentTemplateId = template.parentId;
        }
        return breadcrumbs;
    }

 async deleteTemplate(id) {
    const transaction = await sequelize.transaction();

    try {
        const template = await this.model.findByPk(id);

        if (!template) {
            throw new Error('Template not found');
        }

        if (template.status === 'DELETED') {
            throw new Error('Template is already deleted');
        }
        await template.update({
            status: 'DELETED'
        }, { transaction });

        await transaction.commit();

        return { success: true, message: 'Template deleted successfully' };
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}
}