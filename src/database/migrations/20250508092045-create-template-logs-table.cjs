// src/database/migrations/08-create-template-logs.js
'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('template_logs', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.literal('gen_random_uuid()'), // for PostgreSQL; change if using MySQL
                primaryKey: true
            },
            action: {
                type: Sequelize.STRING,
                allowNull: false
            },
            performedBy: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            previousStatus: {
                type: Sequelize.STRING,
                allowNull: true
            },
            newStatus: {
                type: Sequelize.STRING,
                allowNull: true
            },
            changedBlocks: {
                type: Sequelize.JSONB, // Use JSON for MySQL, JSONB for PostgreSQL
                allowNull: true
            },
            notes: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            templateId: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'template_libraries',
                    key: 'id'
                }
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn('NOW')
            }
        });

        // Optional: add index on templateId for fast lookup
        await queryInterface.addIndex('template_logs', ['templateId']);
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('template_logs');
    }
};