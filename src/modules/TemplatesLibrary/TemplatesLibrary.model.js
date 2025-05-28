import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import { TEMPLATE_STATUS, TEMPLATE_TYPE, FOLDER_LOCATION } from '../../helpers/constants/index.js';

/**
 * Template Library model for storing templates and folders
 */
export default class TemplateLibrary extends Model {
    /**
     * Define model associations
     * @param {Object} models - All registered models
     */
    static associate(models) {
        TemplateLibrary.belongsTo(models.Channel, { foreignKey: 'channelId', as: 'channel' });
        TemplateLibrary.belongsTo(models.TemplateLibrary, { foreignKey: 'parentId', as: 'parent' });
        TemplateLibrary.belongsTo(models.TemplateLibrary, { foreignKey: 'folderId', as: 'folder' });
        TemplateLibrary.belongsTo(models.TemplateLibrary, { foreignKey: 'layoutId', as: 'layout' });
        TemplateLibrary.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
        TemplateLibrary.hasOne(models.TemplateApproval, {
            foreignKey: 'templateId',
            as: 'templateApproval'
        });

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
    }
}

// Initialize the model
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
        allowNull: false
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
    }
}, {
    sequelize,
    modelName: 'TemplateLibrary',
    tableName: 'template_libraries',
    paranoid: false
});