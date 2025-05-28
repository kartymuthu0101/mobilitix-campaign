import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import { CONTENT_BLOCK_TYPES } from '../../helpers/constants/index.js';

/**
 * ContentBlock model for storing template content blocks
 */
export default class ContentBlock extends Model {
    /**
     * Define model associations
     * @param {Object} models - All registered models
     */
    static associate(models) {
        ContentBlock.belongsTo(models.TemplateLibrary, { foreignKey: 'templateId', as: 'template' });
        ContentBlock.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
        
        // Many-to-many relationship with TemplateLibrary
        ContentBlock.belongsToMany(models.TemplateLibrary, {
            through: 'TemplateBlock',
            foreignKey: 'contentBlockId',
            otherKey: 'templateId',
            as: 'templates'
        });
    }
}

// Initialize the model
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
        allowNull: true
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
    paranoid: false
});