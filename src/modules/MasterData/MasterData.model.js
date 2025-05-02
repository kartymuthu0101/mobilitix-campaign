const mongoose = require('mongoose');
const { MASTER_DATA_TYPES } = require('../../helpers/constants');
const { Schema } = mongoose;

const masterDataSchema = new Schema({
    type: {
        type: String,
        required: true,
        enum: [...Object.values(MASTER_DATA_TYPES)]
    },
    key: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
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

const MasterData = mongoose.model('MasterData', masterDataSchema);

module.exports = MasterData;