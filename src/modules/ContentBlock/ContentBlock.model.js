const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');
const { CONTENT_BLOCK_TYPES } = require('../../helpers/constants');

class ContentBlock extends Model {}

ContentBlock.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(CONTENT_BLOCK_TYPES)]
        }
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    buttonType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    url: {
        type: DataTypes.STRING,
        allowNull: true
    },
    countryCode: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    isGlobal: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdById: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'ContentBlock',
    tableName: 'content_blocks',
    paranoid: true
});

// Define associations
ContentBlock.associate = (models) => {
    ContentBlock.belongsTo(models.TemplateLibrary, { foreignKey: 'templateId', as: 'template' });
    ContentBlock.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
};

module.exports = ContentBlock;