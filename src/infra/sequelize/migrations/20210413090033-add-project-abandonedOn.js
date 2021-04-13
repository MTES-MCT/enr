'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('projects', 'abandonedOn', {
      type: Sequelize.DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    })
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn('projects', 'abandonedOn')
  }
};
