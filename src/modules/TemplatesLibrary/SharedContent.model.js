import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';

/**
 * SharedContent model for managing content access permissions
 */
export default class SharedContent extends Model {
    /**
     * Define model associations
     * @param {Object} models - All registered models
     */
    static associate(models) {
        SharedContent.belongsTo(models.TemplateLibrary, { foreignKey: 'templateId', as: 'template' });
        SharedContent.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
        SharedContent.belongsTo(models.User, { foreignKey: 'sharedById', as: 'sharedBy' });
    }
}

// Initialize the model
SharedContent.init({
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
    userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    accessType: {
        type: DataTypes.ENUM('read', 'write', 'admin'),
        defaultValue: 'read'
    },
    sharedById: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    sharedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    sequelize,
    modelName: 'SharedContent',
    tableName: 'shared_content',
    timestamps: true,
    paranoid: false
});