const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');
const { TEMPLATE_STATUS, TEMPLATE_TYPE, FOLDER_LOCATION } = require('../../helpers/constants');

class TemplateLibrary extends Model {}

TemplateLibrary.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    language: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    channelId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    },
    templateType: {
        type: DataTypes.STRING,
        allowNull: true
    },
    parentId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    folderId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [Object.values(TEMPLATE_STATUS)]
        }
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(TEMPLATE_TYPE)]
        }
    },
    layoutId: {
        type: DataTypes.UUID,
        allowNull: true
    },
    isPublished: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdById: {
        type: DataTypes.UUID,
        allowNull: true
    },
    currentVersion: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    folderLocation: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isIn: [Object.values(FOLDER_LOCATION)]
        }
    }
}, {
    sequelize,
    modelName: 'TemplateLibrary',
    tableName: 'template_libraries',
    paranoid: true
});

// Define associations
TemplateLibrary.associate = (models) => {
    TemplateLibrary.belongsTo(models.Channel, { foreignKey: 'channelId', as: 'channel' });
    TemplateLibrary.belongsTo(models.TemplateLibrary, { foreignKey: 'parentId', as: 'parent' });
    TemplateLibrary.belongsTo(models.TemplateLibrary, { foreignKey: 'folderId', as: 'folder' });
    TemplateLibrary.belongsTo(models.TemplateLibrary, { foreignKey: 'layoutId', as: 'layout' });
    TemplateLibrary.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
    
    // Self-referential relationship for parent-child folders
    TemplateLibrary.hasMany(models.TemplateLibrary, { foreignKey: 'parentId', as: 'children' });
    
    // Many-to-many relationship with ContentBlocks
    TemplateLibrary.belongsToMany(models.ContentBlock, { 
        through: 'TemplateBlock',
        foreignKey: 'templateId',
        otherKey: 'contentBlockId',
        as: 'contentBlocks'
    });
    
    // Many-to-many relationship with Users for sharing
    TemplateLibrary.belongsToMany(models.User, { 
        through: 'SharedContent',
        foreignKey: 'templateId',
        otherKey: 'userId',
        as: 'sharedWith'
    });
};

module.exports = TemplateLibrary;