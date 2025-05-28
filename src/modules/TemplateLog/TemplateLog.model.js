import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import { TEMPLATE_LOG_ACTIONS } from '../../helpers/constants/index.js';

export default class TemplateLog extends Model {
    static associate(models) {
        TemplateLog.belongsTo(models.User, { foreignKey: 'performedBy', as: 'actionBy' });
        TemplateLog.belongsTo(models.TemplateLibrary, { foreignKey: 'templateId', as: 'template' });
    }
}

TemplateLog.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    action: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(TEMPLATE_LOG_ACTIONS)]
        }
    },
    performedBy: {
        type: DataTypes.UUID,
        allowNull: false
    },
    previousStatus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    newStatus: {
        type: DataTypes.STRING,
        allowNull: true
    },
    changedBlocks: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'TemplateLog',
    tableName: 'template_logs',
    paranoid: false,
    indexes: [
        {
            fields: ['templateId']
        }
    ]
});
