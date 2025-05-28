import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../utils/connectDb.js';
import bcrypt from 'bcrypt';

/**
 * User model class
 */
export default class User extends Model {
  /**
   * Compare provided password with user's stored password
   * @param {string} password - Password to compare
   * @returns {Promise<boolean>} - True if passwords match
   */
  async comparePassword(password) {
    return bcrypt.compare(password, this.password);
  }

  /**
   * Define model associations
   * @param {Object} models - All registered models
   */
  static associate(models) {
    User.belongsToMany(models.TemplateLibrary, {
      through: 'SharedContent',
      foreignKey: 'userId',
      as: 'sharedTemplates'
    });

    // Other associations
    User.hasMany(models.Channel, { foreignKey: 'createdById', as: 'createdChannels' });
    User.hasMany(models.Channel, { foreignKey: 'updatedById', as: 'updatedChannels' });
    User.hasMany(models.TemplateLibrary, { foreignKey: 'createdById', as: 'createdTemplates' });
    User.hasMany(models.MasterData, { foreignKey: 'createdById', as: 'createdMasterData' });
    User.hasMany(models.ContentBlock, { foreignKey: 'createdById', as: 'createdContentBlocks' });
  }
}

// Initialize User model
User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'first_name'  // Explicitly define field name
  },
  last_name: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'last_name'  // Explicitly define field name
  },
  employee_id: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'employee_id'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'password_hash'
  },
  role_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'role_id',
    references: {
      model: 'roles',
      key: 'id'
    }
  },
  permissions: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: []
  },
  reset_token: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'reset_token'
  },
  reset_token_expiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reset_token_expiry'
  },
  is_reset_token_used: {
    type: DataTypes.BOOLEAN,
    field: 'is_reset_token_used'
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  created_by: {
    type: DataTypes.STRING,
    field: 'created_by'
  },
  updated_by: {
    type: DataTypes.STRING,
    field: 'updated_by'
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_deleted'
  },
}, {
  sequelize,
  modelName: 'User',
  tableName: 'users',
  underscored: true,
  paranoid: false, // Adds deletedAt for soft deletes
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});