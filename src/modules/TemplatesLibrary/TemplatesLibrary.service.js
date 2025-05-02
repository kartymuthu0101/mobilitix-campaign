const BaseService = require("../../common/BaseService.js");
const TemplateLibraryModel = require("./TemplatesLibrary.model.js");
const { mongoose } = require("mongoose");
const { TEMPLATE_STATUS } = require('../../helpers/constants/index.js');

class UserService extends BaseService {
    constructor() {
        super(TemplateLibraryModel);
    }

    async findOneWithContentBlocks(condition = {}, options = {}) {
        try {
            return await this.model.findOne(condition)
                .populate("contentBlocks", "-__v -isGlobal -createdAt -updatedAt")
                .lean(options.lean || false)
                .select(options.select || '');
        } catch (error) {
            throw error;
        }
    }

    async findFolderGroupCount(folderId) {
        try {
            return await this.model.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(folderId) } },
                {
                    $graphLookup: {
                        from: 'templatelibraries',
                        startWith: "$parentId",
                        connectFromField: "parentId",
                        connectToField: "_id",
                        as: "parentChain",
                        depthField: "depth" // Depth starts from 0
                    }
                },
                {
                    $addFields: {
                        parentChain: {
                            $sortArray: {
                                input: "$parentChain",
                                sortBy: { depth: 1 } // sort by depth ascending: 0 ➔ 1 ➔ 2
                            }
                        }
                    }
                }
            ]);


        } catch (error) {
            throw error;
        }
    }

    async checkFolderNameExistance(folderId, userId, name, type) {
        try {

            let findCondition = {
                type: type,
                name: name,
                status: { $ne: TEMPLATE_STATUS.DELETED },
                $or: [
                    { createdBy: new mongoose.Types.ObjectId(userId) },
                    { sharedWith: { $in: [new mongoose.Types.ObjectId(userId)] } }
                ]
            };
            
            // Add parentId condition if folderId is present
            if (folderId) {
                findCondition.parentId = new mongoose.Types.ObjectId(folderId);
            } else {
                findCondition.$or.push(
                    { parentId: { $exists: false } },
                    { parentId: null }
                );
            }

            return await this.model.findOne(findCondition)
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

            const matchStage = { ...filters };

            if (channelId) {
                matchStage.channelId = new mongoose.Types.ObjectId(channelId);
            }

            if (id) {
                matchStage.$or = [
                    { createdBy: new mongoose.Types.ObjectId(id) },
                    { sharedWith: { $in: [new mongoose.Types.ObjectId(id)] } }
                ]
            }

            if (parentId) {
                matchStage.parentId = new mongoose.Types.ObjectId(parentId);
            }

            if (folderLocation) {
                matchStage.folderLocation = folderLocation;
            }

            if (search) {
                matchStage.name = { $regex: search, $options: 'i' };
            }

            if (startDate || endDate) {
                matchStage.createdAt = {};
            
                if (startDate) {
                    const start = new Date(startDate);
                    start.setHours(0, 0, 0, 0);
                    matchStage.createdAt.$gte = start;
                }
            
                if (endDate) {
                    const end = new Date(endDate);
                    end.setHours(23, 59, 59, 999);
                    matchStage.createdAt.$lte = end;
                }
            }
            
            // Build aggregation pipeline
            const aggregationPipeline = [
                { $match: matchStage },
                {
                    $sort: {
                        createdAt: -1, // Default: sort createdBy in descending order
                    }
                },
                // {
                //     $lookup: {
                //         from: 'masterdatas',
                //         localField: 'languageId',
                //         foreignField: '_id',
                //         as: 'languageId'
                //     }
                // },
                // { $unwind: { path: '$languageId', preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: 'channels',
                        localField: 'channelId',
                        foreignField: '_id',
                        as: 'channelId'
                    }
                },
                { $unwind: { path: '$channelId', preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: 'templatelibraries',
                        localField: 'parentId',
                        foreignField: '_id',
                        as: 'parentId'
                    }
                },
                { $unwind: { path: '$parentId', preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: 'templatelibraries',
                        localField: 'folderId',
                        foreignField: '_id',
                        as: 'folderId'
                    }
                },
                { $unwind: { path: '$folderId', preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: 'templatelibraries',
                        localField: 'layoutId',
                        foreignField: '_id',
                        as: 'layoutId'
                    }
                },
                { $unwind: { path: '$layoutId', preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: 'users',
                        localField: 'createdBy',
                        foreignField: '_id',
                        as: 'createdBy'
                    }
                },
                { $unwind: { path: '$createdBy', preserveNullAndEmptyArrays: true } },

                {
                    $lookup: {
                        from: 'users',
                        localField: 'sharedWith',
                        foreignField: '_id',
                        as: 'sharedWith'
                    }
                },
                {
                    $lookup: {
                        from: 'contentblocks',
                        localField: 'blocks.contentBlockId',
                        foreignField: '_id',
                        as: 'contentBlocks'
                    }
                },
                { $skip: +skip },
                { $limit: +limit },
            ];

            // Run aggregation
            const dataPromise = this.model.aggregate(aggregationPipeline).exec();

            // Separate count query
            const countPromise = this.model.countDocuments(matchStage).exec();

            const [data, total] = await Promise.all([dataPromise, countPromise]);

            return { data, total };
        } catch (error) {
            throw error;
        }
    }

    async getSharedFolderUsers(id) {
        try {

            let aggregateQuery = [
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(id)
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'sharedWith',
                        foreignField: '_id',
                        as: 'sharedWith',
                        pipeline: [
                            {
                                $project: {
                                    _id: 1,
                                    email: 1
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        sharedWith: 1
                    }
                }
            ];

            return await this.model.aggregate(aggregateQuery).exec();

        } catch (error) {
            throw error;
        }
    }
    
}

module.exports = UserService;