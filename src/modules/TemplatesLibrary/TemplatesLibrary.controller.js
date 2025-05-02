const { default: mongoose } = require("mongoose");
const BaseController = require("../../common/BaseController.js");
const statusCodes = require("../../helpers/constants/httpStatusCodes.js");
const statusMsg = require("../../helpers/constants/httpStatusMessage.js");
const TemplateService = require("./TemplatesLibrary.service.js");
const ContentBlockService = require("../ContentBlock/ContentBlock.service.js");
const MasterDataService = require("../MasterData/MasterData.service.js");
const ChannelService = require("../Channel/Channel.service.js");
const customMessage = require("../../helpers/constants/customeMessage.js");
const { MAX_COUNTS, TEMPLATE_STATUS } = require('../../helpers/constants/index.js');
const { paginate } = require("../../helpers/index.js")

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

            let { name, type, parentId, channelId, folderLocation } = req.body

            let { id } = req.user

            let sameFolderNameInTheDirectory = await this.templateLibraryService.checkFolderNameExistance(parentId, id, name, type)

            if (sameFolderNameInTheDirectory) {

                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_BAD_REQUEST,
                    customMessage.FOLDER_NAME_ALREADY_EXISTS
                )

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
                )
            }

            const data = await this.templateLibraryService.create({ name, type, parentId, createdBy: new mongoose.Types.ObjectId(id), channelId, folderLocation });

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.FOLDER_CREATED_SUCCESS,
                data
            )

        } catch (error) {
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                error
            )
        }
    }

    getAllFolder = async (req, res) => {
        try {
            const { page = 1, limit = 10, ...filters } = req.query;
            const { id } = req.user
            const skip = (+page - 1) * +limit;

            const paginationPayload = { skip, limit, ...filters, id };
            const data = await this.templateLibraryService.getPaginatedFolderList(paginationPayload);

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                statusMsg.HTTP_OK,
                paginate(data?.data, +page, +limit, +data?.total)
            );

        } catch (err) {

            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                err
            )

        }

    };

    updateFolderPermissions = async (req, res) => {

        try {

            const { id } = req.params;

            let pattern = /^[0-9a-fA-F]{24}$/;
            if (!pattern.test(id))
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.NOT_VALID_ID
                )

            const { userIdsToAdd, userIdsToRemove } = req.body || {};

            const isPathExist = await this.templateLibraryService.getOne({ _id: id, status: { $ne: TEMPLATE_STATUS.DELETED } }, { lean: true, select: "_id" });

            if (!isPathExist)
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.FOLDER_NOT_FOUND
                )

            const updateQuery = {};

            if (userIdsToAdd?.length > 0) {
                updateQuery.$addToSet = {
                    sharedWith: { $each: userIdsToAdd.map(id => new mongoose.Types.ObjectId(id)) }
                };
            }

            if (userIdsToRemove?.length > 0) {
                updateQuery.$pull = {
                    sharedWith: { $in: userIdsToRemove.map(id => new mongoose.Types.ObjectId(id)) }
                };
            }

            const data = await this.templateLibraryService.updateOne(new mongoose.Types.ObjectId(id), updateQuery, { lean: true })

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.ACCESS_UPDATED_SUCCESS,
                data
            )

        } catch (error) {
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                err
            )
        }

    }

    getFolderPermissions = async (req, res) => {

        try {

            const { id } = req.params;

            let pattern = /^[0-9a-fA-F]{24}$/;
            if (!pattern.test(id))
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.NOT_VALID_ID
                )

            const result = await this.templateLibraryService.getSharedFolderUsers(id);

            if (!result?.length)
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.FOLDER_NOT_FOUND
                )


            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.ACCESS_UPDATED_SUCCESS,
                result[0]
            )

        } catch (error) {
            this.sendResponse(
                req,
                res,
                statusCodes.HTTP_INTERNAL_SERVER_ERROR,
                statusMsg[500],
                {},
                err
            )
        }

    }

    // get single template for template editor screen
    getTemplate = async (req, res) => {
        const { id } = req.params;

        // if ID not valid
        let pattern = /^[0-9a-fA-F]{24}$/;
        if (!pattern.test(id))
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            )

        const data = await this.templateLibraryService.findOneWithContentBlocks({ _id: id }, {
            select: "-createdAt -updatedAt -isPublished -type -currentVersion -__v"
        });

        // if data not found
        if (!data)
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_NOT_FOUND,
                customMessage.TEMPLATE_NOT_FOUND
            )

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
        )
    }

    // create template, triggers when - submit filename in popup, clone template
    createTemplate = async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const { blocks: blocksData = [], ...templateData } = req.body || {};

            let finalTemplate = null;

            finalTemplate = await this.templateLibraryService.create(templateData, { lean: true }, { session });

            if (blocksData?.length) {
                const blocks = await this.contentBlockService.bulkCreate(
                    blocksData.map(block => ({
                        ...block,
                        templateId: finalTemplate._id
                    })),
                    { lean: true },
                    { session }
                );
                finalTemplate = await this.templateLibraryService.update(
                    finalTemplate._id,
                    { blocks: blocks.map(b => ({ contentBlockId: b._id })) },
                    {},
                    { session, new: true }
                );
            }
            await session.commitTransaction();
            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.TEMPLATE_CREATE_SUCCESS,
                { id: finalTemplate._id }
            )

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    }

    // update template with block contents
    updateTemplate = async (req, res) => {
        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            const { id, blocks: blocksData = [], ...templateData } = req.body || {};

            const isTemplateExist = await this.templateLibraryService.getOne({ _id: id }, { lean: true, select: "_id" });

            if (!isTemplateExist)
                return this.sendResponse(
                    req,
                    res,
                    statusCodes.HTTP_NOT_FOUND,
                    customMessage.TEMPLATE_NOT_FOUND
                )

            let modifiedTemplateData = { ...templateData, blocks: [] };

            if (blocksData.length) {
                let updateBlockData = blocksData.filter(block => block.id);

                let updatedBlocks = [], createdBlocks = [];
                if (updateBlockData.length) {

                    updatedBlocks = await this.contentBlockService.bulkUpdate(
                        updateBlockData.map(block => {
                            let { id, ...restBlock } = block || {}
                            return {
                                ...restBlock,
                                templateId: id,
                                _id: block.id
                            }
                        }),
                        { lean: true },
                        { session }
                    );
                    updateBlockData.map(({ id }) => modifiedTemplateData.blocks.push({ contentBlockId: id }))

                }

                let createBlockData = blocksData.filter(block => !block.id);
                if (createBlockData) {
                    createdBlocks = await this.contentBlockService.bulkCreate(
                        createBlockData.map(block => ({
                            ...block,
                            templateId: id,
                        })),
                        { lean: true },
                        { session }
                    );

                    createdBlocks.map(({ _id: id }) => modifiedTemplateData.blocks.push({ contentBlockId: id }))
                }
            }

            const finalTemplate = await this.templateLibraryService.update(
                id,
                modifiedTemplateData,
                { lean: true },
                { session, new: true }
            );

            await session.commitTransaction();

            return this.sendResponse(
                req,
                res,
                statusCodes.HTTP_OK,
                customMessage.TEMPLATE_UPDATE_SUCCESS,
                {
                    id: finalTemplate._id,
                    fileName: finalTemplate.fileName,
                    blocks: finalTemplate.blocks
                }
            )

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    }
}

module.exports = TemplateLibraryController;