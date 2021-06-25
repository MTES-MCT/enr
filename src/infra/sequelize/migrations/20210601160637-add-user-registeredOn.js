'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction()
    try{
      await queryInterface.addColumn('users', 'registeredOn', {
        type: Sequelize.DataTypes.DATE,
        allowNull: true,
      },
      {
        transaction
      })

      await queryInterface.sequelize.query(
        'UPDATE "users" SET "registeredOn" = "createdAt"',
        {
          transaction,
        }
      )
      await transaction.commit()
    }
    catch(err){
      await transaction.rollback()
      throw err
    }
  },

  down: async (queryInterface, Sequelize) => {
  }
};
