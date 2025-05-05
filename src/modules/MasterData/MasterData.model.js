const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');
const { MASTER_DATA_TYPES } = require('../../helpers/constants');

class MasterData extends Model {}

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
    paranoid: true
});

// Define associations
MasterData.associate = (models) => {
    MasterData.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
};

module.exports = MasterData;