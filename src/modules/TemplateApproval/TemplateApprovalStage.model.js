import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import { TEMPLATE_APPROVAL_STATUS } from '../../helpers/constants/index.js';

export default class TemplateApprovalStage extends Model {
    static associate(models) {
        // Association to TemplateLibrary
        // TemplateApprovalStage.belongsTo(models.TemplateLibrary, { foreignKey: 'template_id', as: 'template' });

        // Association to TemplateApproval
        TemplateApprovalStage.belongsTo(models.TemplateApproval, {
            foreignKey: 'templateApprovalId',
            as: 'approval'
        });

        TemplateApprovalStage.belongsTo(models.User, { foreignKey: 'updatedBy', as: 'actionBy' });
    }
}

TemplateApprovalStage.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    templateApprovalId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'template_approvals',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(TEMPLATE_APPROVAL_STATUS)]
        }
    },
    level: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    roleId: {
        type: DataTypes.UUID,
        allowNull: false
    },
    timeLimit: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    warningOffset: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    approver: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
            isEmail: true
        },
    },
    escalators: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
        validate: {
            isEmailArray(value) {
                if (!Array.isArray(value) || value.some(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
                    throw new Error('Each escalator must be a valid email address');
                }
            }
        }
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: true
    },
    warnAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    escalateAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    isEscalated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'TemplateApprovalStage',
    tableName: 'template_approval_stages', // ✅ Correct table name
    underscored: true,
    paranoid: false,
    indexes: [
        {
            fields: ['templateApprovalId'] // ✅ Corrected index
        }
    ]
});
