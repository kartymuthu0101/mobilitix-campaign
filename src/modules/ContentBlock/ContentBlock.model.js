const mongoose = require('mongoose');
const { CONTENT_BLOCK_TYPES } = require('../../helpers/constants');
const { Schema } = mongoose;

const contentBlockSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: [...Object.values(CONTENT_BLOCK_TYPES)]
    },
    content: {
        type: String,
        required: true,
    },
    templateId: {
        type: Schema.Types.ObjectId,
        ref: 'TemplateLibrary'
    },
    buttonType: String,
    url: String,
    countryCode: String,
    phoneNumber: String,
    tags: [String],
    isGlobal: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true, // Adds createdAt and updatedAt automatically
    toJSON: { virtuals: true }, // Include virtuals when converted to JSON
    toObject: { virtuals: true } // Include virtuals when converted to objects
});

// Indexes for better query performance
// contentBlockSchema.index({ name: 1, type: 1 }); // Compound index
// contentBlockSchema.index({ isGlobal: 1 });
// contentBlockSchema.index({ createdBy: 1 });

// Optional: Add virtuals or methods if needed
// contentBlockSchema.virtual('creator', {
//     ref: 'User',
//     localField: 'createdBy',
//     foreignField: '_id',
//     justOne: true
// });

const ContentBlock = mongoose.model('ContentBlock', contentBlockSchema);

module.exports = ContentBlock;