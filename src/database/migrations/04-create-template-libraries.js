// src/database/migrations/04-create-template-libraries.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('template_libraries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      language: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        defaultValue: []
      },
      channelId: {
        type: Sequelize.UUID,
        references: {
          model: 'channels',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      category: {
        type: Sequelize.STRING,
        allowNull: true
      },
      templateType: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parentId: {
        type: Sequelize.UUID,
        references: {
          model: 'template_libraries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      folderId: {
        type: Sequelize.UUID,
        references: {
          model: 'template_libraries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false
      },
      layoutId: {
        type: Sequelize.UUID,
        references: {
          model: 'template_libraries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      createdById: {
        type: Sequelize.UUID,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      currentVersion: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      folderLocation: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('template_libraries');
  }
};