'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('modificationRequests', 'confirmationRequestedBy', {
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
    })
    await queryInterface.addColumn('modificationRequests', 'confirmationRequestedOn', {
      type: Sequelize.DataTypes.BIGINT,
      allowNull: true,
    })
    await queryInterface.addColumn('modificationRequests', 'confirmedBy', {
      type: Sequelize.DataTypes.UUID,
      allowNull: true,
    })
    await queryInterface.addColumn('modificationRequests', 'confirmedOn', {
      type: Sequelize.DataTypes.BIGINT,
      allowNull: true,
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('modificationRequests', 'confirmationRequestedBy')
    await queryInterface.removeColumn('modificationRequests', 'confirmationRequestedOn')
    await queryInterface.removeColumn('modificationRequests', 'confirmedBy')
    await queryInterface.removeColumn('modificationRequests', 'confirmedOn')
  }
};
