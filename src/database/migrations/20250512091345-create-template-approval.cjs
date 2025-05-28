'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('template_approvals', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            template_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'template_libraries',
                    key: 'id'
                }
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false
            },
            priority: {
                type: Sequelize.ENUM("HIGH", "MEDIUM", "LOW"),
                allowNull: false
            },
            created_by: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                }
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        });

        await queryInterface.addIndex('template_approvals', ['template_id']);
    },

    down: async(queryInterface) => {
        await queryInterface.dropTable('template_approvals');
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_template_approvals_status";`);
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_template_approvals_priority";`);
    }
};