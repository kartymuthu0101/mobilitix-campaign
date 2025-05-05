const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');

class TemplateBlock extends Model {}

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
    timestamps: true
});

module.exports = TemplateBlock;