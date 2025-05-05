const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../utils/connectDb');

class Channel extends Model {}

Channel.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
    },
    channel_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active'
    },
    createdById: {
        type: DataTypes.UUID,
        allowNull: true
    },
    updatedById: {
        type: DataTypes.UUID,
        allowNull: true
    }
}, {
    sequelize,
    modelName: 'Channel',
    tableName: 'channels',
    paranoid: true
});

// Define associations
Channel.associate = (models) => {
    Channel.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
    Channel.belongsTo(models.User, { foreignKey: 'updatedById', as: 'updatedBy' });
    Channel.hasMany(models.TemplateLibrary, { foreignKey: 'channelId', as: 'templates' });
};

module.exports = Channel;