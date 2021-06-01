import { DataTypes } from 'sequelize'
import { makeProjector } from '../../helpers'

export const userProjector = makeProjector()

export const MakeUserModel = (sequelize) => {
  const User = sequelize.define(
    'user',
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      projectAdmissionKey: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      registeredOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  )

  User.associate = (models) => {
    // Add belongsTo etc. statements here
  }

  User.projector = userProjector

  return User
}
