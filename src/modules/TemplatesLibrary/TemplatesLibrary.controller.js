import { v4 as uuidv4 } from 'uuid';
import { sequelize } from '../../utils/connectDb.js';
import BaseController from '../../common/BaseController.js';
import statusCodes from '../../helpers/constants/httpStatusCodes.js';
import statusMsg from '../../helpers/constants/httpStatusMessage.js';
import TemplateService from './TemplatesLibrary.service.js';
import ContentBlockService from '../ContentBlock/ContentBlock.service.js';
import TemplateLogService from '../TemplateLog/TemplateLog.service.js';
import MasterDataService from '../MasterData/MasterData.service.js';
import ChannelService from '../Channel/Channel.service.js';
import NotificationService from '../Notification/Notification.service.js';
import customMessage from '../../helpers/constants/customeMessage.js';
import { MAX_COUNTS, TEMPLATE_LOG_ACTIONS, TEMPLATE_STATUS } from '../../helpers/constants/index.js';
import { paginate } from '../../helpers/index.js';

/**
 * Controller for template library operations
 */
export default class TemplateLibraryController extends BaseController {
    /**
     * Constructor
     */
    constructor() {
        super();
        this.templateLibraryService = new TemplateService();
        this.contentBlockService = new ContentBlockService();
        this.masterDataService = new MasterDataService();
        this.channelService = new ChannelService();
        this.templateLogService = new TemplateLogService();
        this.notificationService = new NotificationService()
    }

    /**
     * Create a new folder
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    createFolder = async (req, res) => {
        try {
            const { name, type, parentId, channelId, folderLocation } = req.body;
            const { id } = req.user || {};

            const sameFolderNameInTheDirectory = await this.templateLibraryService
                .checkFolderNameExistance(parentId, id, name, type);

            if (sameFolderNameInTheDirectory) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    customMessage.FOLDER_NAME_ALREADY_EXISTS
                );
            }

            // Check for maximum subfolder depth
            let subFolderSearch = parentId
                ? await this.templateLibraryService.findFolderGroupCount(parentId)
                : null;

            if (parentId && subFolderSearch?.[0]?.parentChain?.length === MAX_COUNTS.SUB_FOLDERS) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    customMessage.MAX_FOLDERS_CREATED
                );
            }

            // Create new folder
            const data = await this.templateLibraryService.create({
                id: uuidv4(),
                name,
                type,
                parentId,
                createdById: id,
                channelId,
                folderLocation,
                status: TEMPLATE_STATUS.DRAFT
            });

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.FOLDER_CREATED_SUCCESS,
                data
            );
        } catch (error) {
            console.error("Error creating folder:", error);
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
     * Get all folders with pagination and filtering
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getAllFolder = async (req, res) => {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            const { id } = req.user;
            const offset = (+page - 1) * +limit;

            const paginationPayload = {
                offset,
                limit: +limit,
                ...filters,
                id
            };

            const data = await this.templateLibraryService.getPaginatedFolderList(paginationPayload);

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg.HTTP_OK,
                paginate(data?.data, +page, +limit, +data?.count)
            );
        } catch (error) {
            console.error("Error getting folders:", error);
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
     * Update folder permissions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    updateFolderPermissions = async (req, res) => {
        try {
            const { id } = req.params;
            const { userIdsToAdd, userIdsToRemove, isNotifyPeople } = req.body || {};

            // Validate UUID format
            if (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.NOT_VALID_ID
                );
            }

            const isPathExist = await this.templateLibraryService.getOne({
                id
            }, {
                attributes: ['id']
            });

            if (!isPathExist) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.FOLDER_NOT_FOUND
                );
            }

            const data = await this.templateLibraryService.updateSharedUsers(
                id,
                userIdsToAdd || [],
                userIdsToRemove || [],
                { sharedById: req.user.id }
            );

            if (userIdsToAdd?.length && isNotifyPeople) {
                await Promise.all(
                    userIdsToAdd.map(user =>
                        this.notificationService.create({
                            type: "NOTIFY_PEOPLE_FOR_SHARE",
                            templateId: id,
                            sendTo: user.userId,
                            fromUser: req?.user?.id,
                        })
                    )
                );
            }

            if (userIdsToRemove?.length && isNotifyPeople) {
                await Promise.all(
                    userIdsToRemove.map(userId =>
                        this.notificationService.create({
                            type: "NOTIFY_PEOPLE_FOR_SHARE",
                            templateId: id,
                            sendTo: userId,
                            fromUser: req?.user?.id,
                        })
                    )
                );
            }

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.ACCESS_UPDATED_SUCCESS,
                data
            );
        } catch (error) {
            console.error("Error updating folder permissions:", error);
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
     * Get folder permissions
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getFolderPermissions = async (req, res) => {
        try {
            const { id } = req.params;

            // Validate UUID format
            if (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.NOT_VALID_ID
                );
            }

            const result = await this.templateLibraryService.getSharedFolderUsers(id);

            if (!result) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.FOLDER_NOT_FOUND
                );
            }

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.ACCESS_UPDATED_SUCCESS,
                result
            );
        } catch (error) {
            console.error("Error getting folder permissions:", error);
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
     * Get template by ID for editor screen
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    getTemplate = async (req, res) => {
        const { id } = req.params;

        // Validate UUID format
        if (!(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))) {
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            );
        }

        const data = await this.templateLibraryService.findOneWithContentBlocks({
            id
        }, {
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'isPublished', 'type', 'currentVersion']
            }
        });

        // If data not found
        if (!data) {
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            );
        }

        // Success response
        this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg.HTTP_OK,
            {
                id: data.id,
                name: data.name,
                fileName: data.fileName,
                status: data.status,
                contentBlocks: data.contentBlocks,
                language: data.language,
                category: data.category,
                templateType: data.templateType,
            }
        );
    }

    /**
     * Create a new template
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    createTemplate = async (req, res) => {

        try {
            const { blocks: blocksData = [], ...templateData } = req.body || {};

            // Generate a UUID for the template
            templateData.id = uuidv4();

            templateData.createdById = req.user.id;

            const isDuplicateName = await this.templateLibraryService.getOne({
                name: templateData?.name
            })

            if (isDuplicateName)
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    customMessage.DUPLICATE_TEMPLATE_NAME,
                );
            let finalTemplate;
            await sequelize.transaction(async (transaction) => {
                // Create template
                finalTemplate = await this.templateLibraryService.create(
                    templateData,
                    {},
                    { transaction }
                );

                // Create content blocks if provided
                if (blocksData?.length) {
                    // Create content blocks
                    const blocks = await this.contentBlockService.bulkCreate(
                        blocksData.map(block => ({
                            id: uuidv4(),
                            ...block,
                            templateId: finalTemplate.id
                        })),
                        {},
                        { transaction }
                    );

                    await Promise.all(blocks.map((block, i) =>
                        this.templateLibraryService.createTemplateBlock({
                            id: uuidv4(),
                            templateId: finalTemplate.id,
                            contentBlockId: block.id,
                            orderIndex: i
                        }, { transaction })
                    ));

                    // Reload template with content blocks
                    finalTemplate = await this.templateLibraryService.findOneWithContentBlocks(
                        { id: finalTemplate.id },
                        {},
                        { transaction }
                    );
                }

                await this.templateLogService.create({
                    action: TEMPLATE_LOG_ACTIONS.CREATE,
                    performedBy: req?.user?.id,
                    changedBlocks: finalTemplate,
                    templateId: finalTemplate?.id,
                    newStatus: TEMPLATE_STATUS.DRAFT
                }, {}, { transaction })

            })

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.TEMPLATE_CREATE_SUCCESS,
                { id: finalTemplate.id }
            );
        } catch (error) {
            console.error("Error creating template:", error);
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
     * Update a template with content blocks
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    updateTemplate = async (req, res) => {

        try {
            const { id, blocks: blocksData = [], ...templateData } = req.body || {};

            // Check if template exists
            const isTemplateExist = await this.templateLibraryService.getOne(
                { id },
                { attributes: ['id', 'name', 'status'] },
                // { transaction }
            );

            if (!isTemplateExist) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.TEMPLATE_NOT_FOUND
                );
            }

            if ([TEMPLATE_STATUS.APPROVED, TEMPLATE_STATUS.PENDING].includes(isTemplateExist?.status))
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    customMessage.TEMPLATE_CANNOT_UPDATED,
                );

            if (templateData?.name && isTemplateExist?.name != templateData?.name) {
                const isDuplicateName = await this.templateLibraryService.getOne({
                    name: templateData?.name
                })

                if (isDuplicateName)
                    return this.sendResponse(
                        req,
                        res,
                        statusCodes.HTTP_BAD_REQUEST,
                        customMessage.DUPLICATE_TEMPLATE_NAME,
                    );
            }

            let finalTemplate;
            await sequelize.transaction(async (transaction) => {
                // Update template data
                await this.templateLibraryService.update(
                    id,
                    {
                        ...templateData,
                        status: TEMPLATE_STATUS.DRAFT
                    },
                    {},
                    { transaction }
                );

                // Handle content blocks
                if (blocksData.length > 0) {

                    let blockIds = [];

                    await this.templateLibraryService.deleteTemplateBlocks({ templateId: id }, { transaction })
                    // Update existing blocks
                    const updateBlockData = blocksData.filter(block => block.id);

                    if (updateBlockData.length) {
                        for (const block of updateBlockData) {
                            const { id: blockId, ...blockData } = block;
                            const updatedBlock = await this.contentBlockService.update(
                                blockId,
                                blockData,
                                {},
                                { transaction }
                            );
                            await this.templateLibraryService.createTemplateBlock({
                                id: uuidv4(),
                                templateId: id,
                                contentBlockId: updatedBlock.id,
                                // orderIndex: updateBlockData.length + i
                            }, { transaction });
                        }
                    }

                    // Create new blocks
                    const createBlockData = blocksData.filter(block => !block.id);
                    if (createBlockData.length) {
                        const newBlocks = await this.contentBlockService.bulkCreate(
                            createBlockData.map(block => ({
                                id: uuidv4(),
                                ...block,
                                templateId: id
                            })),
                            {},
                            { transaction, raw: true }
                        );

                        // Create associations for new blocks
                        for (let i = 0; i < newBlocks.length; i++) {
                            await this.templateLibraryService.createTemplateBlock({
                                id: uuidv4(),
                                templateId: id,
                                contentBlockId: newBlocks[i].id,
                                // orderIndex: updateBlockData.length + i
                            }, { transaction });
                        }
                    }
                }

                // Get updated template with blocks
                finalTemplate = await this.templateLibraryService.findOneWithContentBlocks(
                    { id },
                    {},
                    { transaction }
                );

                await this.templateLogService.create({
                    action: TEMPLATE_LOG_ACTIONS.UPDATE,
                    performedBy: req?.user?.id || "9cd3016a-ab76-464d-a380-bd8abecbd131",
                    changedBlocks: finalTemplate,
                    templateId: id,
                    newStatus: TEMPLATE_STATUS.DRAFT
                }, {}, { transaction })

            })

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.TEMPLATE_UPDATE_SUCCESS,
                {
                    id: finalTemplate.id,
                    fileName: finalTemplate.fileName,
                    contentBlocks: finalTemplate.contentBlocks
                }
            );
        } catch (error) {
            console.error("Error updating template:", error);
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

    searchTemplates = async (req, res) => {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            let userId = req.user.id
            const offset = (+page - 1) * +limit;

            const searchPayload = {
                offset,
                limit: +limit,
                ...filters
            };

            const result = await this.templateLibraryService.searchGlobalTemplates(searchPayload, userId);

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg.HTTP_OK,
                paginate(result?.data, +page, +limit, +result?.total)
            );
        } catch (error) {
            console.error("Global Search Error:", error);
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            );
        }
    };
    /**
     * Recursively builds the full path for a template or folder
     * @param {UUID} id - The ID of the template/folder
     * @returns {Promise<string>} - The full path (e.g., folder1/folder2/fileName)
     */
    getTemplatePath = async (req, res) => {
        const { id } = req.params;

        const pathParts = [];

        let current = await this.templateLibraryService.getOne({ id }, {
            select: ['id', 'name', 'parentId'],
        });

        if (!current) {
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND,
            );
        }

        // Traverse up using parentId
        while (current) {
            pathParts.push(current); // Add current name to beginning of array
            if (!current.parentId) break; // Root reached
            current = await this.templateLibraryService.getOne({ id: current.parentId }, {
                select: ['id', 'name', 'parentId'],
            });
        }

        return this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg[200],
            pathParts
        );
    }

    deleteTemplate = async (req, res) => {
        const { id } = req.params;
        const userId = req.user.id;

        // Validate template ID
        if (!id) {
            return errorResponse(res, 'Template ID is required', 400);
        }

        // Call service to soft delete template
        const result = await this.templateLibraryService.deleteTemplate(id, userId);

        return this.sendResponse(
            req,
            res,
            statusCodes.HTTP_OK,
            statusMsg[200],
            result

        );
    }
}

