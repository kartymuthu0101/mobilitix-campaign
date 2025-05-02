const mongoose = require("mongoose");
const { TEMPLATE_STATUS, TEMPLATE_TYPE, FOLDER_LOCATION } = require("../../helpers/constants");

const Schema = mongoose.Schema;


const TemplateLibrarySchema = new Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    language: {
        type: [String],
        trim: true
    },
    channelId: {
        type: Schema.Types.ObjectId,
        ref: 'Channel'
    },
    category: {
        type: String,
        trim: true
    },
    templateType: {
        type: String,
        trim: true
    },
    parentId: {
        type: Schema.Types.ObjectId,
        ref: 'TemplateLibrary'
    },
    folderId: {
        type: Schema.Types.ObjectId,
        ref: 'TemplateLibrary'
    },
    status: {
        type: String,
        enum: [
            TEMPLATE_STATUS.DRAFT,
            TEMPLATE_STATUS.PENDING,
            TEMPLATE_STATUS.APPROVED,
            TEMPLATE_STATUS.REJECTED,
            TEMPLATE_STATUS.PUBLISHED,
            TEMPLATE_STATUS.ARCHIVED,
            TEMPLATE_STATUS.DELETED,
        ]
    },
    type: {
        type: String,
        enum: [
            TEMPLATE_TYPE.FOLDER,
            TEMPLATE_TYPE.TEMPLATE
        ],
        required: true
    },
    blocks: [
        {
            contentBlockId: {
                type: Schema.Types.ObjectId,
                ref: 'ContentBlock',
                required: true // Optional: depends on your validation needs
            }
        }
    ],
    layoutId: {
        type: Schema.Types.ObjectId,
        ref: 'TemplateLibrary'
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    currentVersion: {
        type: Number,
        default: 1,
        min: 1
    },
    sharedWith: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    folderLocation: {
        type: String,
        enum: [
            FOLDER_LOCATION.ENTERPRISE_TEMPLATE,
            FOLDER_LOCATION.MOBILYTIX_TEMPLATE
        ],
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add index for frequently queried fields
TemplateLibrarySchema.index({ name: 1, type: 1, status: 1 });

TemplateLibrarySchema.virtual('contentBlocks', {
    ref: 'ContentBlock',
    localField: 'blocks.contentBlockId',
    foreignField: '_id',
    justOne: false
});

const TemplateLibraryModel = mongoose.model("TemplateLibrary", TemplateLibrarySchema);

module.exports = TemplateLibraryModel;