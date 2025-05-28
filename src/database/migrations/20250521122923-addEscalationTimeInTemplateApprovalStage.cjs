'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('template_approval_stages', 'warn_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        await queryInterface.addColumn('template_approval_stages', 'escalate_at', {
            type: Sequelize.DATE,
            allowNull: true,
        });

        await queryInterface.addColumn('template_approval_stages', 'is_escalated', {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('template_approval_stages', 'warn_at');
        await queryInterface.removeColumn('template_approval_stages', 'escalate_at');
        await queryInterface.removeColumn('template_approval_stages', 'is_escalated');
    }
};
