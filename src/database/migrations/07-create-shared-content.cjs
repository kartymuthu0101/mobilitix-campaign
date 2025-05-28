// src/database/migrations/07-create-shared-content.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('shared_content', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      templateId: {
        type: Sequelize.UUID,
        references: {
          model: 'template_libraries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      userId: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      accessType: {
        type: Sequelize.ENUM('read', 'write', 'admin'),
        defaultValue: 'read'
      },
      sharedById: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      sharedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
    
    // Add unique constraint
    await queryInterface.addConstraint('shared_content', {
      fields: ['templateId', 'userId'],
      type: 'unique',
      name: 'shared_content_template_id_user_id_unique'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('shared_content');
  }
};