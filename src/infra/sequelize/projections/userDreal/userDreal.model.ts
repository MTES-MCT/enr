import { DataTypes } from 'sequelize'
import { makeProjector } from '../../helpers'

export const userDrealProjector = makeProjector()

export const MakeUserDrealModel = (sequelize) => {
  const UserDreal = sequelize.define(
    'userDreal',
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      dreal: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  )

  UserDreal.associate = (models) => {
    const { User } = models

    UserDreal.belongsTo(User, { foreignKey: 'userId' })
  }

  UserDreal.projector = userDrealProjector

  return UserDreal
}
