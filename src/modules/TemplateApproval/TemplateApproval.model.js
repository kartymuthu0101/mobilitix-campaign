import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import { ESCALATION_MATRIX_PRIORITIES, TEMPLATE_APPROVAL_STATUS } from '../../helpers/constants/index.js';

export default class TemplateApproval extends Model {
    static associate(models) {
        TemplateApproval.belongsTo(models.TemplateLibrary, { foreignKey: 'templateId', as: 'template' });
        TemplateApproval.hasMany(models.TemplateApprovalStage, { foreignKey: 'templateApprovalId', as: 'stages' });
    }
}

TemplateApproval.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    templateId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(TEMPLATE_APPROVAL_STATUS)]
        }
    },
    priority: {
        type: DataTypes.ENUM(...Object.values(ESCALATION_MATRIX_PRIORITIES)),
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false
    }
}, {
    sequelize,
    modelName: 'TemplateApproval',
    tableName: 'template_approvals',
    paranoid: false,
    underscored: true,
    indexes: [
        {
            fields: ['templateId']
        }
    ]
});
