import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';

/**
 * TemplateBlock model for managing template and content block associations
 */
export default class TemplateBlock extends Model {
    /**
     * Define model associations
     * @param {Object} models - All registered models
     */
    static associate(models) {
        // No additional associations needed as this is a join table
        // that already has associations defined in the related models
    }
}

// Initialize the model
TemplateBlock.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'template_libraries',
            key: 'id'
        }
    },
    contentBlockId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'content_blocks',
            key: 'id'
        }
    },
    orderIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    sequelize,
    modelName: 'TemplateBlock',
    tableName: 'template_blocks',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['templateId', 'contentBlockId']
        }
    ]
});