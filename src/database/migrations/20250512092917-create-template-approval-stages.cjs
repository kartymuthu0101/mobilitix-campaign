'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('template_approval_stages', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                primaryKey: true
            },
            template_approval_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'template_approvals',
                    key: 'id'
                }
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false
            },
            level: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            role_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'roles',
                    key: 'id'
                }
            },
            approver: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: false
            },
            time_limit: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            warning_offset: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            escalators: {
                type: Sequelize.ARRAY(Sequelize.STRING),
                allowNull: false
            },
            updated_by: {
                type: Sequelize.UUID,
                allowNull: true,
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

        await queryInterface.addIndex('template_approval_stages', ['template_approval_id']);
    },

    down: async(queryInterface) => {
        await queryInterface.dropTable('template_approval_stages');
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_template_approval_stages_status";`);
        await queryInterface.sequelize.query(`DROP TYPE IF EXISTS "enum_template_approval_stages_priority";`);
    }
};