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
      registeredOn: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      keycloakId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
    },
    {
      timestamps: true,
    }
  )

  User.associate = (models) => {
    // Add belongsTo etc. statements here
    const { Project } = models
    User.hasMany(Project, { as: 'candidateProjects', foreignKey: 'email', sourceKey: 'email' })
  }

  User.projector = userProjector

  return User
}
