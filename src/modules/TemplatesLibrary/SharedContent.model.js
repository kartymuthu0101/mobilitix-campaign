const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');

class SharedContent extends Model {}

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
    paranoid: true
});

// Define associations
SharedContent.associate = (models) => {
    SharedContent.belongsTo(models.TemplateLibrary, { foreignKey: 'templateId', as: 'template' });
    SharedContent.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    SharedContent.belongsTo(models.User, { foreignKey: 'sharedById', as: 'sharedBy' });
};

module.exports = SharedContent;