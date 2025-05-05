const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');
const BaseController = require("../../common/BaseController.js");
const statusCodes = require("../../helpers/constants/httpStatusCodes.js");
const statusMsg = require("../../helpers/constants/httpStatusMessage.js");
const TemplateService = require("./TemplatesLibrary.service.js");
const ContentBlockService = require("../ContentBlock/ContentBlock.service.js");
const MasterDataService = require("../MasterData/MasterData.service.js");
const ChannelService = require("../Channel/Channel.service.js");
const customMessage = require("../../helpers/constants/customeMessage.js");
const { MAX_COUNTS, TEMPLATE_STATUS } = require('../../helpers/constants/index.js');
const { paginate } = require("../../helpers/index.js");

class TemplateLibraryController extends BaseController {
    templateLibraryService;
    contentBlockService;
    masterDataService;
    channelService;
    constructor() {
        super();
        this.templateLibraryService = new TemplateService();
        this.contentBlockService = new ContentBlockService();
        this.masterDataService = new MasterDataService();
        this.channelService = new ChannelService();
    }

    createFolder = async (req, res) => {
        try {
            let { name, type, parentId, channelId, folderLocation } = req.body;
            let { id } = req.user;

            let sameFolderNameInTheDirectory = await this.templateLibraryService.checkFolderNameExistance(parentId, id, name, type);

            if (sameFolderNameInTheDirectory) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    customMessage.FOLDER_NAME_ALREADY_EXISTS
                );
            }

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

            const data = await this.templateLibraryService.create({
                id: uuidv4(),
                name,
                type,
                parentId,
                createdById: id,
                channelId,
                folderLocation
            });

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.FOLDER_CREATED_SUCCESS,
                data
            );
        } catch (error) {
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
                paginate(data?.rows, +page, +limit, +data?.count)
            );
        } catch (error) {
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

    updateFolderPermissions = async (req, res) => {
        try {
            const { id } = req.params;
            const { userIdsToAdd, userIdsToRemove } = req.body || {};

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
                id: id,
                status: {
                    [Op.ne]: TEMPLATE_STATUS.DELETED
                }
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

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.ACCESS_UPDATED_SUCCESS,
                data
            );
        } catch (error) {
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

    // get single template for template editor screen
    getTemplate = async (req, res) => {
        try {
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
                id: id 
            }, {
                attributes: { 
                    exclude: ['createdAt', 'updatedAt', 'isPublished', 'type', 'currentVersion'] 
                }
            });

            // if data not found
            if (!data) {
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.TEMPLATE_NOT_FOUND
                );
            }

            // success response
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
        } catch (error) {
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

    // create template, triggers when - submit filename in popup, clone template
    createTemplate = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { blocks: blocksData = [], ...templateData } = req.body || {};

            // Generate a UUID for the template
            templateData.id = uuidv4();
            
            // Create template
            let finalTemplate = await this.templateLibraryService.create(
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
                
                // Create template-block associations
                for (let i = 0; i < blocks.length; i++) {
                    await sequelize.models.TemplateBlock.create({
                        id: uuidv4(),
                        templateId: finalTemplate.id,
                        contentBlockId: blocks[i].id,
                        orderIndex: i
                    }, { transaction });
                }
                
                // Reload template with content blocks
                finalTemplate = await this.templateLibraryService.findOneWithContentBlocks(
                    { id: finalTemplate.id },
                    {},
                    { transaction }
                );
            }
            
            await transaction.commit();
            
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.TEMPLATE_CREATE_SUCCESS,
                { id: finalTemplate.id }
            );
        } catch (error) {
            await transaction.rollback();
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

    // update template with block contents
    updateTemplate = async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { id, blocks: blocksData = [], ...templateData } = req.body || {};

            // Check if template exists
            const isTemplateExist = await this.templateLibraryService.getOne(
                { id: id }, 
                { attributes: ['id'] },
                { transaction }
            );

            if (!isTemplateExist) {
                await transaction.rollback();
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.TEMPLATE_NOT_FOUND
                );
            }

            // Update template data
            await this.templateLibraryService.update(
                id,
                templateData,
                {},
                { transaction }
            );

            // Handle content blocks
            if (blocksData.length > 0) {
                // Update existing blocks
                const updateBlockData = blocksData.filter(block => block.id);
                if (updateBlockData.length) {
                    for (const block of updateBlockData) {
                        const { id: blockId, ...blockData } = block;
                        await this.contentBlockService.update(
                            blockId,
                            blockData,
                            {},
                            { transaction }
                        );
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
                        { transaction }
                    );

                    // Create associations for new blocks
                    for (let i = 0; i < newBlocks.length; i++) {
                        await sequelize.models.TemplateBlock.create({
                            id: uuidv4(),
                            templateId: id,
                            contentBlockId: newBlocks[i].id,
                            orderIndex: updateBlockData.length + i
                        }, { transaction });
                    }
                }
            }

            // Get updated template with blocks
            const finalTemplate = await this.templateLibraryService.findOneWithContentBlocks(
                { id: id },
                {},
                { transaction }
            );

            await transaction.commit();

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
            await transaction.rollback();
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

module.exports = TemplateLibraryController;