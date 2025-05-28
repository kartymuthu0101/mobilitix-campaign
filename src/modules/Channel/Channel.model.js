import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';

/**
 * Channel model for communication channels
 */
export default class Channel extends Model {
    /**
     * Define model associations
     * @param {Object} models - All registered models
     */
    static associate(models) {
        Channel.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
        Channel.belongsTo(models.User, { foreignKey: 'updatedById', as: 'updatedBy' });
        Channel.hasMany(models.TemplateLibrary, { foreignKey: 'channelId', as: 'templates' });
    }
}

// Initialize the model
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
    paranoid: false
});