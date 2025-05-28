import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import { MASTER_DATA_TYPES } from '../../helpers/constants/index.js';

/**
 * MasterData model for application metadata
 */
export default class MasterData extends Model {
    /**
     * Define model associations
     * @param {Object} models - All registered models
     */
    static associate(models) {
        MasterData.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
    }
}

// Initialize the model
MasterData.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            isIn: [Object.values(MASTER_DATA_TYPES)]
        }
    },
    key: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.STRING,
        allowNull: false
    },
    createdById: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'MasterData',
    tableName: 'master_data',
    paranoid: false,
    indexes: [
        {
            unique: true,
            fields: ['type', 'key']
        }
    ]
});