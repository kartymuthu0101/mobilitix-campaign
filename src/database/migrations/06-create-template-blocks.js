// src/database/migrations/06-create-template-blocks.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('template_blocks', {
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
      contentBlockId: {
        type: Sequelize.UUID,
        references: {
          model: 'content_blocks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      orderIndex: {
        type: Sequelize.INTEGER,
        defaultValue: 0
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
    await queryInterface.addConstraint('template_blocks', {
      fields: ['templateId', 'contentBlockId'],
      type: 'unique',
      name: 'template_blocks_template_id_content_block_id_unique'
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('template_blocks');
  }
};