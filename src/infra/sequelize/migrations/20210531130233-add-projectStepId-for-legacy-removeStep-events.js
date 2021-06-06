'use strict'
const uuid = require('uuid')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()

    try {
      const events = await queryInterface.sequelize.query(
        `SELECT id as eventId, payload->>'projectId' as projectId FROM "eventStores" where type = 'ProjectGFRemoved'`,
        {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }
      )

      const projectIds = events
        .reduce(({ projectId }, acc) => `${acc}, ${projectId}`, '')
        .slice(0, -1)

      const projectStepsIds = await queryInterface.sequelize.query(
        `SELECT id FROM project_steps WHERE id IN (${projectIds}) and type = 'garantie-financiere'`,
        {
          type: queryInterface.sequelize.QueryTypes.SELECT,
          transaction,
        }
      )

      events.events.map(({ eventId, projectStepId }) => {
        queryInterface.sequelize.query(
          `UPDATE "eventStores" set payload->>projectStepId = ${projectStepId} where `
        )
      })

      await transaction.commit()
    } catch (err) {
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
}
